/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/utils/supabase/server'
import { encryptSecret, maskSecret } from '@/lib/integration-vault'
import { revalidatePath } from 'next/cache'

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v23.0'

function normalizeId(value: string) {
    return value.trim().replace(/\s+/g, '')
}

async function getCurrentTenant() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No autorizado')

    const { data: roleData } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .maybeSingle()

    if (!roleData?.tenant_id) throw new Error('Usuario sin tenant activo')

    return { supabase, tenantId: roleData.tenant_id }
}

async function getOrCreateFirstBot(supabase: any, tenantId: string) {
    let { data: bot } = await supabase
        .from('bots')
        .select('id')
        .eq('tenant_id', tenantId)
        .limit(1)
        .maybeSingle()

    if (!bot) {
        const { data: newBot } = await supabase
            .from('bots')
            .insert({
                tenant_id: tenantId,
                name: 'Bot Principal',
                system_prompt: 'Eres un asistente servicial.'
            })
            .select('id')
            .maybeSingle()
        bot = newBot
    }

    if (!bot?.id) throw new Error('No se pudo identificar un bot valido')
    return bot
}

function mapMetaError(error: any) {
    const code = error?.code
    const message = error?.message || 'Meta rechazo la solicitud.'

    if (code === 190) return 'El token de acceso no es valido o expiro. Genera un token nuevo desde Meta Business.'
    if (code === 10 || code === 200) return 'El token no tiene permisos suficientes. Revisa que tenga whatsapp_business_messaging y whatsapp_business_management.'
    if (code === 100) return 'El Phone Number ID no existe o no pertenece a ese token.'

    return message
}

export async function connectWhatsAppAction({
    accessToken,
    phoneNumberId,
    wabaId,
    botId
}: {
    accessToken: string
    phoneNumberId: string
    wabaId: string
    botId?: string
}) {
    try {
        const token = accessToken.trim()
        const normalizedPhoneNumberId = normalizeId(phoneNumberId)
        const normalizedWabaId = normalizeId(wabaId)

        if (!token || !normalizedPhoneNumberId || !normalizedWabaId) {
            throw new Error('Completa token, Phone Number ID y WABA ID antes de conectar.')
        }

        const { supabase, tenantId } = await getCurrentTenant()
        const bot = botId ? { id: botId } : await getOrCreateFirstBot(supabase, tenantId)

        const metaResponse = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${normalizedPhoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
        })

        const metaData = await metaResponse.json()

        if (!metaResponse.ok) {
            throw new Error(mapMetaError(metaData?.error))
        }

        if (metaData.id !== normalizedPhoneNumberId) {
            throw new Error('Meta respondio con un Phone Number ID diferente. Revisa el dato copiado.')
        }

        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
        if (!verifyToken) {
            throw new Error('Falta configurar WHATSAPP_VERIFY_TOKEN en el servidor.')
        }

        const encryptedToken = encryptSecret(token)

        const { error: upsertError } = await supabase
            .from('bot_integrations')
            .upsert({
                tenant_id: tenantId,
                bot_id: bot.id,
                channel: 'whatsapp',
                config: {
                    access_token_encrypted: encryptedToken,
                    access_token_hint: maskSecret(token),
                    phone_number_id: normalizedPhoneNumberId,
                    waba_id: normalizedWabaId,
                    webhook_verify_token: verifyToken,
                    display_phone_number: metaData.display_phone_number || null,
                    verified_name: metaData.verified_name || null,
                    quality_rating: metaData.quality_rating || 'UNKNOWN',
                    code_verification_status: metaData.code_verification_status || 'UNKNOWN',
                    graph_api_version: GRAPH_API_VERSION,
                    sandbox_mode: true,
                    last_verified_at: new Date().toISOString(),
                    processed_message_ids: []
                },
                is_active: true
            }, { onConflict: 'bot_id,channel' })

        if (upsertError) throw upsertError

        revalidatePath('/dashboard/integrations')

        return {
            success: true,
            message: 'WhatsApp conectado y validado con Meta.',
            phone: metaData.display_phone_number,
            quality: metaData.quality_rating || 'UNKNOWN'
        }
    } catch (error: any) {
        console.error('Error en connectWhatsAppAction:', error?.message || error)
        return { success: false, error: error.message || 'No se pudo conectar WhatsApp.' }
    }
}

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
