/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '@/utils/supabase/admin';
import { processBotMessage } from '@/lib/bot-engine';

export async function POST(req: Request) {
    console.log("📨 Webhook Telegram recibido...");
    try {
        const body = await req.json();
        console.log("📦 Payload:", JSON.stringify(body, null, 2));

        if (!body.message || !body.message.text) {
            console.log("⚠️ No es un mensaje de texto. Ignorando.");
            return new Response('OK', { status: 200 });
        }

        const chatId = body.message.chat.id.toString();
        const text = body.message.text;

        const { searchParams } = new URL(req.url);
        const botAuthToken = searchParams.get('token');

        if (!botAuthToken) {
            console.error("❌ Token ausente en URL");
            return new Response('No token', { status: 401 });
        }

        const supabase = createAdminClient();

        console.log("🔍 Buscando bot_id para el token...");
        const { data: integration, error: intError } = await supabase
            .from('bot_integrations')
            .select('bot_id, tenant_id, config')
            .eq('channel', 'telegram')
            .contains('config', { token: botAuthToken })
            .single();

        if (intError) {
            console.error("❌ Error Supabase:", intError.message);
            return new Response('Database Error', { status: 500 });
        }

        if (!integration) {
            console.error("❌ Integración no encontrada en DB");
            return new Response('Bot not found', { status: 404 });
        }

        console.log("🤖 Bot encontrado:", integration.bot_id);
        const { bot_id, tenant_id } = integration;

        console.log("🧠 Enviando a Bot Engine...");
        const result = await processBotMessage(supabase, {
            tenantId: tenant_id,
            botId: bot_id,
            messages: [{ role: 'user', content: text }],
            channel: 'telegram',
            platformId: chatId,
            streamResponse: false
        });

        const replyText = result.text || "Lo siento, tuve un problema procesando tu mensaje.";
        console.log("📝 Respuesta generada:", replyText);

        const telegramUrl = `https://api.telegram.org/bot${botAuthToken}/sendMessage`;
        const tRes = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: replyText
            })
        });

        const tData = await tRes.json();
        console.log("🚀 Telegram Response:", tData);

        return new Response('OK', { status: 200 });

    } catch (error: any) {
        console.error("🔥 Error crítico en Webhook Telegram:", error);
        return new Response('Error', { status: 500 });
    }
}
