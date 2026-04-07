import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // Comprobar si hay un usuario activo
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
        await supabase.auth.signOut()
    }

    // Revalidar el root para limpiar caché del dashboard y super-admin
    revalidatePath('/', 'layout')

    // Reflejamos al usuario hacia el login (URL absoluta obligatoria en redirect del servidor)
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(new URL('/login', requestUrl.origin), {
        status: 302,
    })
}
