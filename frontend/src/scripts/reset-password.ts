/**
 * Script para resetear la contraseña de un usuario via Supabase Admin API
 * Uso: npx tsx src/scripts/reset-password.ts <email> <nueva_contraseña>
 * Ejemplo: npx tsx src/scripts/reset-password.ts admin@admin.com Skylab2026!
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
  console.error('❌ Uso: npx tsx src/scripts/reset-password.ts <email> <password>')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function resetPassword() {
  console.log(`\n🔑 Reseteando contraseña para: ${email}`)

  // 1. Buscar el usuario
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) { console.error('❌ Error listando usuarios:', listError.message); process.exit(1) }

  const user = users.find(u => u.email === email)
  if (!user) { console.error(`❌ Usuario no encontrado: ${email}`); process.exit(1) }

  // 2. Actualizar la contraseña via Admin API
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword
  })

  if (updateError) {
    console.error('❌ Error actualizando contraseña:', updateError.message)
    process.exit(1)
  }

  console.log(`✅ Contraseña actualizada exitosamente`)
  console.log(`📧 Email:    ${email}`)
  console.log(`🔑 Password: ${newPassword}`)
}

resetPassword()
