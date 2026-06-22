/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dns from 'dns'
import { promisify } from 'util'

const lookup = promisify(dns.lookup)

// Inicializar el SDK GenAI de Google
const genAI = new GoogleGenerativeAI((process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY) as string)

function isPrivateIp(ip: string): boolean {
    const parts = ip.split('.').map(Number)
    if (parts.length !== 4) return true // Bloquear si no es formato IPv4 estándar
    return (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        parts[0] === 127 ||
        parts[0] === 0 ||
        (parts[0] === 169 && parts[1] === 254)
    )
}

async function validateUrlSafety(urlStr: string): Promise<boolean> {
    try {
        const url = new URL(urlStr)
        const hostname = url.hostname
        
        // Bloquear localhost e IPs loopback directamente
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') return false
        
        // Resolver IP por DNS
        const { address } = await lookup(hostname)
        return !isPrivateIp(address)
    } catch {
        return false
    }
}

function sanitizeSensitiveData(text: string): string {
    let sanitized = text
    // Enmascarar OpenAI keys, Gemini keys, tarjetas de crédito, JWTs
    sanitized = sanitized.replace(/(sk-[a-zA-Z0-9]{32,})/g, '[LLAVE_API_REMOVIDA]')
    sanitized = sanitized.replace(/(AIzaSy[a-zA-Z0-9-_]{33})/g, '[LLAVE_API_REMOVIDA]')
    sanitized = sanitized.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[TARJETA_CREDITO_REMOVIDA]')
    sanitized = sanitized.replace(/eyJ[a-zA-Z0-9-_]+\.eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+/g, '[TOKEN_JWT_REMOVIDO]')
    return sanitized
}

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

        // 0. Validación de seguridad de URL (Prevención SSRF)
        if (type === 'web') {
            const isSafe = await validateUrlSafety(content)
            if (!isSafe) {
                return NextResponse.json({ error: 'URL no permitida por políticas de seguridad.' }, { status: 400 })
            }
        }

        // 0.1 Algoritmo RAG Crawler Avanzado (Redirección a Jina Reader API)
        if (type === 'web') {
            try {
                // Utilizamos el servicio r.jina.ai para extraer la web como Markdown limpio
                const jinaUrl = `https://r.jina.ai/${content}`;

                const webRes = await fetch(jinaUrl, {
                    headers: {
                        'Accept': 'text/plain',
                        'X-Retain-Images': 'none',
                        'X-Return-Format': 'markdown'
                    }
                });

                if (!webRes.ok) {
                    throw new Error(`Jina Reader falló con código HTTP ${webRes.status}`);
                }

                const markdownText = await webRes.text();

                if (!markdownText || markdownText.length < 50) {
                    throw new Error('El Rasterizador devolvió una página vacía o bloqueada por CAPTCHA.');
                }

                const titleMatch = markdownText.match(/Title:\s*(.+)/i);
                finalTitle = titleMatch ? titleMatch[1].trim() : (title || content);
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

        // 2.1 Verificar límites de cuotas del plan (Tiers)
        const { data: tenantInfo, error: tenantInfoError } = await supabase
            .from('tenants')
            .select('max_docs, docs_count')
            .eq('id', tenantId)
            .single()

        if (tenantInfoError || !tenantInfo) {
            return NextResponse.json({ error: 'Error verificando límites de almacenamiento.' }, { status: 500 })
        }

        if (tenantInfo.docs_count >= tenantInfo.max_docs) {
            return NextResponse.json({ 
                error: `Límite de documentos alcanzado para tu plan actual (${tenantInfo.docs_count}/${tenantInfo.max_docs}). Por favor realiza un upgrade.` 
            }, { status: 403 })
        }

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

        // 3.1 Sanitizar el contenido extraído para remover PII y secretos comerciales
        const sanitizedContent = sanitizeSensitiveData(finalContent);

        // 4. Chunking del texto sanitizado
        const rawChunks = chunkText(sanitizedContent)

        // 4.1 Inyección de Metadatos
        const sourceHeader = `--- DATOS DE ORIGEN ---\nTítulo: ${finalTitle}\nTipo: ${type}\n${type === 'web' ? `URL: ${content}\n` : ''}----------------------\n\n`;
        const enrichedChunks = rawChunks.map(c => sourceHeader + c)

        // 5. Instanciar el modelo de Embedding de Google (gemini-embedding-001)
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" })

        // 6. Vectorización e Inserción Paralela
        const chunkInsertData = await Promise.all(
            enrichedChunks.map(async (textChunk) => {
                try {
                    const result = await embeddingModel.embedContent(textChunk)
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

        // 8.1 Incrementar el contador de documentos en la tabla tenants
        await supabase
            .from('tenants')
            .update({ docs_count: (tenantInfo.docs_count || 0) + 1 })
            .eq('id', tenantId)

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
