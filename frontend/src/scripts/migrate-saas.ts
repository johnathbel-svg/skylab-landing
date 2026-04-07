/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log("🚀 Iniciando migración SaaS directa...");

    const queries = [
        `ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS industry TEXT;`,
        `ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS estimated_monthly_sales INTEGER DEFAULT 0;`,
        `ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS estimated_interactions INTEGER DEFAULT 0;`,
        `ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS requires_voice BOOLEAN DEFAULT FALSE;`,
        `ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS requires_multimedia BOOLEAN DEFAULT TRUE;`,
        `ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS avatar_url TEXT;`,
        `ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS tone_style TEXT DEFAULT 'friendly';`,
        `ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS use_emojis TEXT DEFAULT 'high';`,
        `ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS specialized_industry TEXT;`
    ];

    for (const query of queries) {
        process.stdout.write(`Executing: ${query.substring(0, 50)}... `);
        const { error } = await supabase.rpc('execute_sql_query', { query_text: query });

        // Si el RPC no existe, intentamos vía REST (aunque ALTER TABLE suele requerir RPC o SQL Editor)
        // Pero como somos SERVICE ROLE, podemos intentar ejecutar comandos
        if (error) {
            console.log("❌ Error:", error.message);
            console.log("Intentando vía directa...");
            const { error: directError } = await (supabase as any).from('_raw_sql').insert({ query }); // Hipotético si habilitado
            if (directError) console.log("Final error:", directError.message);
        } else {
            console.log("✅ Éxito");
        }
    }
}

// Nota: Normalmente en Supabase no hay un endpoint de 'raw sql' por defecto por seguridad.
// Si el RPC 'execute_sql_query' no existe, le pediré al usuario que lo pegue en el SQL Editor.
migrate();
