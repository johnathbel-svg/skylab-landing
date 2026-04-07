import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    console.log("--- BOTS ---");
    const { data: bots, error: e1 } = await supabase.from('bots').select('*');
    bots?.forEach(b => console.log(b.name, " -> ", b.system_prompt));

    console.log("\n--- KNOWLEDGE DOCS ---");
    const { data: docs, error: e2 } = await supabase.from('knowledge_docs').select('*');
    docs?.forEach(d => console.log(d.title, " -> ", d.status, d.source_uri));

    console.log("\n--- TOTAL CHUNKS ---");
    const { count, error: e3 } = await supabase.from('knowledge_chunks').select('id', { count: 'exact', head: true });
    console.log(count);
}
check();
