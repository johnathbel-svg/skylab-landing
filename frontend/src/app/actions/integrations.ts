/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function connectTelegramAction(token: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error("No autorizado")

        // 1. Obtener el tenant_id del usuario
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('tenant_id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (!roleData) throw new Error("Usuario no vinculado a ningún Tenant")

        // 2. Obtener el primer bot disponible del tenant (o crear uno si no existe)
        let { data: bot } = await supabase
            .from('bots')
            .select('id')
            .eq('tenant_id', roleData.tenant_id)
            .limit(1)
            .maybeSingle()

        if (!bot) {
            const { data: newBot } = await supabase
                .from('bots')
                .insert({
                    tenant_id: roleData.tenant_id,
                    name: 'Bot de Telegram Default',
                    system_prompt: 'Eres un asistente servicial.'
                })
                .select('id')
                .maybeSingle()
            bot = newBot
        }

        if (!bot) throw new Error("No se pudo identificar un Bot válido")

        // 3. Upsert en bot_integrations
        const { error: upsertError } = await supabase
            .from('bot_integrations')
            .upsert({
                tenant_id: roleData.tenant_id,
                bot_id: bot.id,
                channel: 'telegram',
                config: { token },
                is_active: true
            }, { onConflict: 'bot_id,channel' })

        if (upsertError) throw upsertError

        // 4. Configurar el Webhook en Telegram
        const host = (await (await import('next/headers')).headers()).get('host')
        const protocol = host?.includes('localhost') ? 'http' : 'https'
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
        const webhookUrl = `${baseUrl}/api/webhooks/telegram?token=${token}`

        const telegramRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: webhookUrl })
        })

        const telegramData = await telegramRes.json()

        if (!telegramData.ok) {
            console.error("⚠️ Telegram Webhook Error (Normal en Localhost):", telegramData)

            if (telegramData.description?.includes("HTTPS URL must be provided")) {
                revalidatePath('/dashboard/integrations')
                return {
                    success: true,
                    message: "Token guardado. El Webhook falló por estar en Localhost, pero puedes usar el 'Long Polling (Dev Runner)' para probarlo."
                }
            }

            return {
                success: false,
                error: `Telegram rechazó el webhook: ${telegramData.description}. ¿Estás usando HTTPS y un dominio público?`
            }
        }

        console.log("✅ Webhook registrado con éxito:", webhookUrl)

        revalidatePath('/dashboard/integrations')
        return { success: true, message: "Bot conectado y Webhook configurado correctamente." }

    } catch (error: any) {
        console.error("Error en connectTelegramAction:", error)
        return { success: false, error: error.message }
    }
}

export async function getTenantBotsAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No autorizado');
        const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).maybeSingle();
        if (!roleData) throw new Error('Sin tenant_id');
        const { data: bots, error } = await supabase.from('bots').select('id, name').eq('tenant_id', roleData.tenant_id);
        if (error) throw error;
        return { success: true, bots };
    } catch (error: any) {
        console.error('Error getTenantBotsAction:', error);
        return { success: false, error: error.message };
    }
}
