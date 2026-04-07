/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '@/utils/supabase/admin';
import { processBotMessage } from '@/lib/bot-engine';

// 1. Verificación de Webhook (WhatsApp GET Challenge)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // El TOKEN_DE_VERIFICACION debe coincidir con el configurado en Meta Dashboard
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
    }

    return new Response('Forbidden', { status: 403 });
}

// 2. Recepción de Mensajes (WhatsApp POST)
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validar que sea un mensaje de WhatsApp
        if (!body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
            return new Response('OK', { status: 200 });
        }

        const messageData = body.entry[0].changes[0].value.messages[0];
        const from = messageData.from; // Número del remitente
        const text = messageData.text?.body;
        const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;

        if (!text) return new Response('OK', { status: 200 });

        const supabase = createAdminClient();

        // 3. Buscar integración por phoneNumberId
        const { data: integration, error: intError } = await supabase
            .from('bot_integrations')
            .select('bot_id, tenant_id, config')
            .eq('channel', 'whatsapp')
            .contains('config', { phone_number_id: phoneNumberId })
            .single();

        if (intError || !integration) {
            console.error("WhatsApp Integration not found for ID:", phoneNumberId);
            return new Response('Not found', { status: 404 });
        }

        // 4. Procesar con Motor de IA
        const result = await processBotMessage(supabase, {
            tenantId: integration.tenant_id,
            botId: integration.bot_id,
            messages: [{ role: 'user', content: text }],
            channel: 'whatsapp',
            platformId: from,
            streamResponse: false
        });

        // 5. Responder vía API de Facebook Graph
        const accessToken = (integration.config as any).access_token;
        if (accessToken && result.text) {
            const fbUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
            await fetch(fbUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: from,
                    type: "text",
                    text: { body: result.text }
                })
            });
        }

        return new Response('OK', { status: 200 });

    } catch (error: any) {
        console.error("Error en Webhook WhatsApp:", error);
        return new Response('Error', { status: 500 });
    }
}
