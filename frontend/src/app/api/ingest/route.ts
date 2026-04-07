/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as cheerio from 'cheerio'

// Inicializar el SDK GenAI de Google
const genAI = new GoogleGenerativeAI((process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY) as string)

// Algoritmo rudimentario de Chunking (Tokenización por caracteres como un simple MVP).
// En un sistema real masivo, se reemplazaría por Langchain RecursiveCharacterTextSplitter
function chunkText(text: string, maxChunkSize: number = 800): string[] {
    const chunks = []
    let i = 0
    while (i < text.length) {
        let end = i + maxChunkSize
        // Evitar cortar palabras a la mitad, buscar el último espacio cercano si no estamos en el final
        if (end < text.length) {
            const lastSpace = text.lastIndexOf(' ', end)
            if (lastSpace > i) {
                end = lastSpace
            }
        }
        chunks.push(text.slice(i, end).trim())
        i = end
    }
    return chunks.filter(c => c.length > 10)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { title, content, type, botId } = body

        if (!content || !type) {
            return NextResponse.json({ error: 'Faltan parámetros requeridos (content, type)' }, { status: 400 })
        }

        let finalTitle = title || 'Conocimiento Genérico';
        let finalContent = content;

        // 0. Algoritmo RAG Crawler Avanzado (Redirección a Jina Reader API)
        if (type === 'web') {
            try {
                // Utilizamos el servicio r.jina.ai para extraer la web como Markdown limpio
                // Esto ejecuta JavaScript, burla antibots básicos y escupe Semántica Pura
                const jinaUrl = `https://r.jina.ai/${content}`;

                const webRes = await fetch(jinaUrl, {
                    headers: {
                        'Accept': 'text/plain', // r.jina.ai responde default con Markdown
                        'X-Retain-Images': 'none',
                        'X-Return-Format': 'markdown'
                    }
                });

                if (!webRes.ok) {
                    throw new Error(`Jina Reader falló con código HTTP ${webRes.status}`);
                }

                const markdownText = await webRes.text();

                if (!markdownText || markdownText.length < 50) {
                    throw new Error('El Rasterizador devolvió una página vacía o bloqueada por CAPTCHA Severo.');
                }

                // Jina suele devolver el Título como el primer Header Markdown: "Title: [Titulo]"
                const titleMatch = markdownText.match(/Title:\s*(.+)/i);
                finalTitle = titleMatch ? titleMatch[1].trim() : (title || content);

                // Limpiamos los metadatos iniciales del header de Jina para no abultar los tokens
                finalContent = markdownText.replace(/Title:.*\n/i, '').replace(/URL:.*\n/i, '').trim();

            } catch (err: any) {
                console.error("Error Rasterizador Web:", err);
                return NextResponse.json({ error: `Rasterizador Web Falló: ${err.message}` }, { status: 500 })
            }
        }

        const supabase = await createClient()

        // 1. Verificar Sesión y Extraer Auth User
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // 2. Extraer el tenant_id activo de la persona
        // Recordar que usamos Supabase Postgres, el RLS protegerá las inserciones pero debemos explicitar el tenant_id.
        const { data: tenantData, error: tenantError } = await supabase
            .from('user_roles')
            .select('tenant_id')
            .eq('user_id', user.id)
            .limit(1)
            .single()

        if (tenantError || !tenantData) {
            return NextResponse.json({ error: 'Tenant no encontrado o acceso denegado' }, { status: 403 })
        }

        const tenantId = tenantData.tenant_id

        // 3. Crear el Documento Maestro (knowledge_docs)
        const dbSourceType = type === 'web' ? 'url' : type;

        const { data: doc, error: docError } = await supabase
            .from('knowledge_docs')
            .insert({
                tenant_id: tenantId,
                bot_id: botId && botId !== 'all' ? botId : null,
                title: finalTitle,
                source_type: dbSourceType,
                source_uri: type === 'web' ? content : null,
                status: 'processing'
            })
            .select()
            .single()

        if (docError) {
            console.error('Error insertando documento:', docError)
            return NextResponse.json({ error: 'Error creando registro del documento', details: docError.message }, { status: 500 })
        }

        // 4. Chunking del texto
        const rawChunks = chunkText(finalContent)

        // 4.1 Inyección de Metadatos (Curar la Amnesia de Identidad)
        // Para que Gemini sepa de dónde viene cada fragmento y responda preguntas como "¿cuál es la URL?"
        const sourceHeader = `--- DATOS DE ORIGEN ---\nTítulo: ${finalTitle}\nTipo: ${type}\n${type === 'web' ? `URL: ${content}\n` : ''}----------------------\n\n`;
        const enrichedChunks = rawChunks.map(c => sourceHeader + c)

        // 5. Instanciar el modelo de Embedding de Google (gemini-embedding-001)
        // Usamos este modelo porque la API Key actual arroja 404 para el 004
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" })

        // 6. Vectorización e Inserción Paralela
        // Procesamos los chunks solicitando los arrays flotantes a la API de GenAI.
        const chunkInsertData = await Promise.all(
            enrichedChunks.map(async (textChunk) => {
                try {
                    // Llamada nativa a la API de embeddings de Gemini
                    const result = await embeddingModel.embedContent(textChunk)
                    // Gemini retorna el array de floats(768) en result.embedding.values
                    const vectorArray = result.embedding.values

                    return {
                        tenant_id: tenantId,
                        doc_id: doc.id,
                        bot_id: botId && botId !== 'all' ? botId : null,
                        content: textChunk,
                        embedding: vectorArray
                    }
                } catch (err) {
                    console.error('Error vectorizando chunk:', err)
                    return null
                }
            })
        )

        // Limpiar posibles promesas fallidas
        const validChunks = chunkInsertData.filter(c => c !== null)

        // 7. Bulk Insert a pgvector
        if (validChunks.length > 0) {
            const { error: chunkError } = await supabase
                .from('knowledge_chunks')
                .insert(validChunks)

            if (chunkError) {
                console.error('Error insertando vectores:', chunkError)
                await supabase.from('knowledge_docs').update({ status: 'error' }).eq('id', doc.id)
                return NextResponse.json({ error: 'Error guardando información vectorial' }, { status: 500 })
            }
        }

        // 8. Marcar documento como activo
        await supabase.from('knowledge_docs').update({ status: 'active' }).eq('id', doc.id)

        return NextResponse.json({
            success: true,
            docId: doc.id,
            chunksProcessed: validChunks.length,
            message: 'Inyección de conocimiento completada con éxito.'
        })

    } catch (error: any) {
        console.error('Ingest API Error:', error)
        return NextResponse.json({ error: 'Error fatal del servidor', details: error.message }, { status: 500 })
    }
}
