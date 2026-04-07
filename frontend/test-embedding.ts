import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);

async function testEmbedding() {
    try {
        const text = "Este es un texto de prueba.";
        console.log("INICIANDO TEST...");

        // Tratar con prefijo 'models/' explícito a ver si eso lo soluciona
        const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });
        const result = await model.embedContent(text);

        console.log("EXITO_LONGITUD:", result.embedding.values.length);
    } catch (e: any) {
        console.log("------------- ERROR -------------");
        console.log(e.name);
        console.log(e.status);
        console.log(e.message);
    }
}

testEmbedding();
