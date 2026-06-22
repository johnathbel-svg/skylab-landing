/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'node:crypto'
import { after } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { processBotMessage } from '@/lib/bot-engine'
import { decryptSecret } from '@/lib/integration-vault'
import { isInsideWhatsAppCustomerWindow } from '@/lib/whatsapp-policy'

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v23.0'
const PROCESSED_CACHE_LIMIT = 80

function verifyMetaSignature(rawBody: string, signatureHeader: string | null) {
    const appSecret = process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET

    if (!appSecret) {
        return process.env.NODE_ENV !== 'production'
    }

    if (!signatureHeader?.startsWith('sha256=')) return false

    const expected = `sha256=${crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex')}`

    const expectedBuffer = Buffer.from(expected)
    const receivedBuffer = Buffer.from(signatureHeader)

    if (expectedBuffer.length !== receivedBuffer.length) return false

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}

function extractMessageContent(message: any) {
    if (message?.type === 'text') return message.text?.body || ''
    if (message?.type === 'button') return message.button?.text || message.button?.payload || ''
    if (message?.type === 'interactive') {
        return message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || ''
    }
    if (message?.type === 'image') {
        return message.image?.caption || '[El cliente envio una imagen por WhatsApp. Solicita una descripcion si necesitas mas contexto.]'
    }
    if (message?.type === 'document') {
        const filename = message.document?.filename ? ` llamado ${message.document.filename}` : ''
        return `[El cliente envio un documento${filename} por WhatsApp. Indicale que lo recibiste y pide el dato exacto que necesitas revisar.]`
    }
    if (message?.type === 'audio' || message?.type === 'voice') {
        return '[El cliente envio una nota de voz por WhatsApp. Pidele que escriba el mensaje para poder ayudarle con precision.]'
    }
    if (message?.type === 'location') {
        return '[El cliente compartio una ubicacion por WhatsApp.]'
    }
    if (message?.type === 'contacts') {
        return '[El cliente compartio un contacto por WhatsApp.]'
    }

    return ''
}

function isProcessed(config: any, messageId: string) {
    const ids = Array.isArray(config?.processed_message_ids) ? config.processed_message_ids : []
    return ids.includes(messageId)
}

function appendProcessedId(config: any, messageId: string) {
    const ids = Array.isArray(config?.processed_message_ids) ? config.processed_message_ids : []
    return [...ids.filter((id: string) => id !== messageId), messageId].slice(-PROCESSED_CACHE_LIMIT)
}

async function sendWhatsAppText(phoneNumberId: string, accessToken: string, to: string, text: string) {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: {
                preview_url: true,
                body: text.slice(0, 4096)
            }
        })
    })

    if (!response.ok) {
        const errorBody = await response.text()
        console.error('Meta WhatsApp send failed:', response.status, errorBody)
    }
}

async function processInboundMessage({
    integration,
    phoneNumberId,
    from,
    text
}: {
    integration: any
    phoneNumberId: string
    from: string
    text: string
}) {
    try {
        const supabase = createAdminClient()
        const result = await processBotMessage(supabase, {
            tenantId: integration.tenant_id,
            botId: integration.bot_id,
            messages: [{ role: 'user', content: text }],
            channel: 'whatsapp',
            platformId: from,
            streamResponse: false
        })

        const config = integration.config as any
        const accessToken = decryptSecret(config.access_token_encrypted) || config.access_token

        if (accessToken && result.text && isInsideWhatsAppCustomerWindow(config.last_inbound_at)) {
            await sendWhatsAppText(phoneNumberId, accessToken, from, result.text)
        }
    } catch (error: any) {
        console.error('WhatsApp background processing failed:', error?.message || error)
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN

    if (mode === 'subscribe' && challenge && expectedToken && token === expectedToken) {
        return new Response(challenge, { status: 200 })
    }

    return new Response('Forbidden', { status: 403 })
}

export async function POST(req: Request) {
    const rawBody = await req.text()

    if (!verifyMetaSignature(rawBody, req.headers.get('x-hub-signature-256'))) {
        return new Response('Invalid signature', { status: 401 })
    }

    let body: any
    try {
        body = JSON.parse(rawBody)
    } catch {
        return new Response('Invalid JSON', { status: 400 })
    }

    const change = body.entry?.[0]?.changes?.[0]
    const value = change?.value
    const message = value?.messages?.[0]

    if (!message) {
        return new Response('OK', { status: 200 })
    }

    const phoneNumberId = value?.metadata?.phone_number_id
    const from = message.from
    const messageId = message.id
    const text = extractMessageContent(message)

    if (!phoneNumberId || !from || !messageId) {
        return new Response('OK', { status: 200 })
    }

    const supabase = createAdminClient()

    const { data: integration, error: integrationError } = await supabase
        .from('bot_integrations')
        .select('id, bot_id, tenant_id, config, is_active')
        .eq('channel', 'whatsapp')
        .contains('config', { phone_number_id: phoneNumberId })
        .maybeSingle()

    if (integrationError || !integration?.is_active) {
        console.error('WhatsApp integration unavailable for phone_number_id:', phoneNumberId, integrationError?.message)
        return new Response('OK', { status: 200 })
    }

    const config = integration.config as any
    if (isProcessed(config, messageId)) {
        return new Response('OK', { status: 200 })
    }

    const updatedConfig = {
        ...config,
        processed_message_ids: appendProcessedId(config, messageId),
        last_inbound_at: new Date().toISOString(),
        last_inbound_from: from,
        last_inbound_type: message.type || 'unknown',
        last_inbound_message_id: messageId
    }

    await supabase
        .from('bot_integrations')
        .update({
            config: updatedConfig
        })
        .eq('id', integration.id)

    if (!text) {
        return new Response('OK', { status: 200 })
    }

    after(async () => {
        await processInboundMessage({
            integration: { ...integration, config: updatedConfig },
            phoneNumberId,
            from,
            text
        })
    })

    return new Response('OK', { status: 200 })
}
