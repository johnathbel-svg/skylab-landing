import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';

// Next.js config for Edge runtime or specific timeout
export const maxDuration = 60; // Allows up to 60s for LLM processing

export async function POST(req: Request) {
    try {
        const { messages, systemPrompt } = await req.json();

        // Validar apiKey o manejar el error si no existe en el entorno
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return new Response(JSON.stringify({ error: "GOOGLE_GENERATIVE_AI_API_KEY no configurada. Por favor, añádela a tu .env.local" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemPrompt || "Eres un asistente virtual útil y profesional."
        });

        // Convertir formato agnóstico a formato específico de Google
        const buildGoogleGenAIPrompt = (messages: any[]) => ({
            contents: messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            })),
        });

        // Llamada asíncrona pero nativa y compatible con Vercel old-core
        const streamingResponse = await model.generateContentStream(buildGoogleGenAIPrompt(messages));

        // Empalmar al framework
        const stream = GoogleGenerativeAIStream(streamingResponse);
        return new StreamingTextResponse(stream);

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || 'Error en el servidor AI' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
