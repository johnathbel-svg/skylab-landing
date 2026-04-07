import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);

async function testFinalEmbedding() {
    try {
        console.log("Probando el modelo secreto: 'gemini-embedding-001'");
        const m = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const r = await m.embedContent("Esto es vital para Supabase");
        console.log("OK. Tamaño del Array Flotante:", r.embedding.values.length);
    } catch (e: any) {
        console.log("Error:", e.message);
    }
}

testFinalEmbedding();
