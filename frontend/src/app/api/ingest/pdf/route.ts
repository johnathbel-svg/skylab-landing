/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Inicializar el SDK GenAI de Google
const genAI = new GoogleGenerativeAI((process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY) as string)

function chunkText(text: string, maxChunkSize: number = 800): string[] {
    const chunks = []
    let i = 0
    while (i < text.length) {
        let end = i + maxChunkSize
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
        const formData = await req.formData()
        const file = formData.get('file') as File
        const botId = formData.get('botId') as string
        const originalName = file.name || 'documento.pdf'

        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Archivo PDF no válido' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Verificar Sesión
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // 2. Extraer el tenant_id
        const { data: tenantData, error: tenantError } = await supabase
            .from('user_roles')
            .select('tenant_id')
            .eq('user_id', user.id)
            .single()

        if (tenantError || !tenantData) {
            return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 403 })
        }

        const tenantId = tenantData.tenant_id

        // 3. Crear registro del documento
        const { data: doc, error: docError } = await supabase
            .from('knowledge_docs')
            .insert({
                tenant_id: tenantId,
                bot_id: botId && botId !== 'all' ? botId : null,
                title: originalName,
                source_type: 'pdf',
                status: 'processing'
            })
            .select()
            .single()

        if (docError) {
            return NextResponse.json({ error: 'Error BD', details: docError.message }, { status: 500 })
        }

        // 4. Convertir PDF a Texto usando Gemini 1.5 Flash
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const arrayBuffer = await file.arrayBuffer()
        const base64Data = Buffer.from(arrayBuffer).toString('base64')

        const prompt = "Actúa como un extractor de texto OCR premium. Extrae TODO el contenido de este PDF de forma estructurada. Ignora encabezados y pies de página repetitivos. Devuelve solo el texto limpio."

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "application/pdf"
                }
            },
            prompt
        ])

        const extractedText = result.response.text()

        if (!extractedText || extractedText.length < 50) {
            await supabase.from('knowledge_docs').update({ status: 'error' }).eq('id', doc.id)
            return NextResponse.json({ error: 'Gemini no pudo extraer suficiente texto del PDF' }, { status: 500 })
        }

        // 5. Chunking y Vectorización
        const chunks = chunkText(extractedText)
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" })

        const chunkInsertData = await Promise.all(
            chunks.map(async (textChunk) => {
                try {
                    const res = await embeddingModel.embedContent(textChunk)
                    return {
                        tenant_id: tenantId,
                        doc_id: doc.id,
                        bot_id: botId && botId !== 'all' ? botId : null,
                        content: textChunk,
                        embedding: res.embedding.values
                    }
                } catch (err) {
                    console.error('Error vectorizando:', err)
                    return null
                }
            })
        )

        const validChunks = chunkInsertData.filter(c => c !== null)

        if (validChunks.length > 0) {
            await supabase.from('knowledge_chunks').insert(validChunks)
            await supabase.from('knowledge_docs').update({ status: 'active' }).eq('id', doc.id)
        } else {
            await supabase.from('knowledge_docs').update({ status: 'error' }).eq('id', doc.id)
            return NextResponse.json({ error: 'Fallo al vectorizar los fragmentos' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            docId: doc.id,
            chunksProcessed: validChunks.length,
            message: 'PDF procesado y vectorizado correctamente.'
        })

    } catch (error: any) {
        console.error('PDF Ingest Error:', error)
        return NextResponse.json({ error: 'Error fatal', details: error.message }, { status: 500 })
    }
}
