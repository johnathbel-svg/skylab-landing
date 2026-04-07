import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function listModels() {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();

        if (data.models) {
            console.log("=== MODELOS DISPONIBLES EN TU CUENTA ===");
            const embedModels = data.models.filter((m: any) => m.name.includes("embed") || m.supportedGenerationMethods.includes("embedContent"));

            if (embedModels.length === 0) {
                console.log("CRÍTICO: Tu cuenta de Google NO TIENE NINGÚN MODELO DE EMBEDDING ASIGNADO.");
                console.log("Todos los modelos de tu cuenta:");
                data.models.forEach((m: any) => console.log("- " + m.name));
            } else {
                console.log("Modelos de Embedding encontrados:");
                embedModels.forEach((m: any) => {
                    console.log(`\n- Name: ${m.name}`);
                    console.log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
                });
            }
        } else {
            console.log("Error al listar modelos:", data);
        }
    } catch (e: any) {
        console.error("Error Fetch:", e.message);
    }
}

listModels();
