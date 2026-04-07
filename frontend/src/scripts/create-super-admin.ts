import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno locales
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

// Inicializar cliente con Service Role para saltar políticas RLS y manipular Auth
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
    console.log(`
🛑 Uso incorrecto.

💡 Para crear un Super Admin ejecuta:
   npx tsx src/scripts/create-super-admin.ts [EMAIL] [PASSWORD]

Ejemplo:
   npx tsx src/scripts/create-super-admin.ts admin@skylab.ai SkylabSecure2026!
  `)
    process.exit(1)
}

async function createSuperAdmin() {
    console.log(`\n🚀 Iniciando creación de cuenta Super Admin: ${email}...`)

    try {
        // 1. Crear usuario en Auth (identity provider)
        console.log('1️⃣ Registrando usuario en Supabase Auth...')
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-verificar email
            user_metadata: { name: 'Skylab Master Admin' }
        })

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('⚠️ El usuario ya existe en Auth. Intentando promoverlo de todas formas...')
            } else {
                throw new Error(`Error Auth: ${authError.message}`)
            }
        }

        // Obtener ID (recuperándolo si ya existía o usando el nuevo)
        let finalUserId = authData?.user?.id;

        if (!finalUserId) {
            const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
            if (listError) throw new Error(`List Users Error: ${listError.message}`)
            const found = users.users.find(u => u.email === email)
            if (found) finalUserId = found.id
        }
        if (!finalUserId) throw new Error('No se pudo resolver el UUID del usuario.')

        // 2. Insertarlo en la tabla bloqueada `super_admins`
        console.log(`2️⃣ Otorgando privilegios modo-dios (ID: ${finalUserId})...`)
        const { error: saError } = await supabaseAdmin
            .from('super_admins')
            .insert({ user_id: finalUserId })

        if (saError) {
            if (saError.code === '23505') {
                console.log('✅ El usuario ya era Super Admin previamente.')
            } else {
                throw new Error(`Error BD: ${saError.message}`)
            }
        } else {
            console.log('✅ Cuenta vinculada exitosamente a la tabla super_admins.')
        }

        console.log(`
🎉 ¡ÉXITO! Centro de Mando habilitado.
------------------------------------------------
📧 Email:    ${email}
🔑 Clave:    ${password} (Confidencial)
------------------------------------------------
👉 Ve a: http://localhost:3000/login
Y al entrar, la plataforma te redirigirá a /super-admin
`)

    } catch (error: any) {
        console.error('\n❌ Operación Fallida:', error.message)
        process.exit(1)
    }
}

createSuperAdmin()
