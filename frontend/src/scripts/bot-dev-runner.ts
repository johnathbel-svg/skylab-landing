/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * BotFlow - Dev Runner (Long Polling)
 * Este script permite probar el bot de Telegram localmente SIN Webhooks/Ngrok.
 * Ejecutar con: npx tsx src/scripts/bot-dev-runner.ts
 */

import { createClient } from '@supabase/supabase-js';
import { processBotMessage } from '../lib/bot-engine';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno relativo a la ubicación del script
const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_AI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌ Faltan credenciales de Supabase en .env.local (URL o SERVICE_ROLE_KEY)");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Memoria Local a Corto Plazo (Estilo n8n Agent Memory)
const localMemory: Record<string | number, any[]> = {};

async function pollUpdates() {
    console.log("🚀 Iniciando Skylab Dev Runner (Long Polling)...");

    // 1. Buscar la integración de Telegram activa
    const { data: integrations, error: intError } = await supabase
        .from('bot_integrations')
        .select('*, bots(name)')
        .eq('channel', 'telegram')
        .eq('is_active', true);

    if (intError || !integrations || integrations.length === 0) {
        console.error("❌ No se encontró ninguna integración de Telegram activa en la base de datos.");
        console.log("Tip: Asegúrate de completar el Wizard en el Dashboard primero.");
        return;
    }

    // Por simplicidad, tomamos la primera
    const integration = integrations[0];
    let token = (integration.config as any)?.token;
    const botName = (integration.bots as any)?.name || "Sin nombre";

    if (!token) {
        console.error("❌ La integración no tiene un campo 'token' en config.");
        console.log("Config actual:", integration.config);
        return;
    }

    // SANITIZACIÓN PROFUNDA: Eliminar espacios, saltos de línea y caracteres invisibles
    token = token.trim().replace(/[\s\u200B-\u200D\uFEFF]/g, '');

    console.log(`🔍 Validando token...`);
    console.log(`📏 Longitud: ${token.length} caracteres.`);

    // Unset webhook para permitir polling local
    console.log("🧹 Limpiando webhooks previos para habilitar modo local...");
    try {
        const delRes = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
        const delData = await delRes.json();
        console.log("🧹 Resultado limpieza:", delData.ok ? "Éxito" : `Error (${delData.error_code})`, delData.description || "");
    } catch (e: any) {
        console.warn("⚠️ Advertencia: No se pudo limpiar el webhook (posible fallo de red). Continuando...");
    }

    // Validar Identidad del Bot
    try {
        const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        const meData = await meRes.json();
        if (meData.ok) {
            console.log(`🤖 Bot Validado: @${meData.result.username} (ID: ${meData.result.id})`);
            console.log(`✅ Conectado al Nexus de Skylab`);
        } else {
            console.error("❌ ERROR DE TELEGRAM (404 = Token Incorrecto):", meData);
            return;
        }
    } catch (e: any) {
        console.error("❌ ERROR CRÍTICO DE RED: No se puede alcanzar api.telegram.org");
        console.log("Detalle:", e.message);
        console.log("TIP: Revisa tu firewall, VPN o conexión a Internet.");
        return;
    }

    console.log(`✅ Conectado al Bot: "${botName}"`);
    console.log(`🔗 Token: ${token.substring(0, 10)}... (longitud: ${token.length})`);
    console.log("👂 Escuchando mensajes en Telegram (Presiona Ctrl+C para detener)...");

    let lastUpdateId = 0;

    while (true) {
        try {
            process.stdout.write("."); // Indicador de actividad
            const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`);

            if (!response.ok) {
                const errText = await response.text();
                console.error(`\n❌ Error de API Telegram (${response.status}):`, errText);
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }

            const data = await response.json();

            if (!data.ok) {
                console.error("\n❌ Telegram respondió con error:", data);
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }

            for (const update of data.result) {
                lastUpdateId = update.update_id;

                if (update.message && update.message.text) {
                    try {
                        const chatId = update.message.chat.id;
                        const userText = update.message.text;
                        const userName = update.message.from?.first_name || "Usuario";

                        // Inicializar memoria si no existe
                        if (!localMemory[chatId]) localMemory[chatId] = [];

                        // Añadir mensaje del usuario a memoria local
                        localMemory[chatId].push({ role: 'user', content: userText });
                        // Mantener solo los últimos 20 mensajes (Short-Term Memory Window)
                        if (localMemory[chatId].length > 20) localMemory[chatId].shift();

                        console.log(`\n[${new Date().toLocaleTimeString()}] 📩 ${userName} (ID: ${chatId}): ${userText}`);

                        console.log("🧠 Generando respuesta con Bot Engine (Local Memory Context)...");
                        const result = await processBotMessage(supabase, {
                            tenantId: integration.tenant_id,
                            botId: integration.bot_id,
                            messages: localMemory[chatId], // Pasar TODO el contexto local
                            channel: 'telegram',
                            platformId: chatId.toString(),
                            streamResponse: false
                        });

                        const reply = result.text || "Lo siento, tuve un problema procesando tu mensaje.";
                        console.log(`🤖 Botflow responde: ${reply.substring(0, 50)}...`);

                        // Añadir respuesta del bot a la memoria local
                        localMemory[chatId].push({ role: 'assistant', content: reply });
                        if (localMemory[chatId].length > 20) localMemory[chatId].shift();

                        // Función auxiliar para pausas humanas
                        const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

                        // Enviar estado "typing"
                        const sendTyping = async () => {
                            await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ chat_id: chatId, action: 'typing' })
                            });
                        };

                        // Dividir en bloques por doble salto de línea
                        const blocks = reply.split('\n\n').filter(b => b.trim().length > 0);

                        for (const block of blocks) {
                            const imgRegex = /!\[.*?\]\((.*?)\)/g;
                            const matches = Array.from(block.matchAll(imgRegex));
                            const imageUrls = matches.map(m => m[1]);
                            const cleanText = block.replace(imgRegex, '').trim();

                            if (cleanText.length > 0 || imageUrls.length > 0) {
                                await sendTyping();
                                // Pausa de "pensamiento/escritura" más realista
                                const waitTime = Math.min(Math.max(cleanText.length * 25, 1200), 3500);
                                await sleep(waitTime);

                                if (imageUrls.length > 0) {
                                    for (const url of imageUrls) {
                                        console.log(`📸 Enviando foto: ${url.substring(0, 40)}...`);
                                        const imgRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                chat_id: chatId,
                                                photo: url,
                                                caption: cleanText.length > 0 ? (cleanText.length > 1024 ? cleanText.substring(0, 1000) + "..." : cleanText) : undefined
                                            })
                                        });
                                        const imgData = await imgRes.json();
                                        if (!imgData.ok) console.error("❌ Error de foto:", imgData.description);
                                    }
                                } else if (cleanText.length > 0) {
                                    console.log(`🚀 Enviando bloque de texto...`);
                                    const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ chat_id: chatId, text: cleanText })
                                    });
                                    const sendData = await sendRes.json();
                                    if (!sendData.ok) console.error("❌ Error de texto:", sendData.description);
                                }

                                // Pausa extra entre bloques para que el cliente pueda leer
                                await sleep(800);
                            }
                        }
                        console.log("✅ Ciclo de respuesta humanizada completado.");
                    } catch (msgError: any) {
                        console.error("\n⚠️ Error procesando este mensaje específico:", msgError.message);
                    }
                } else {
                    console.log("ℹ️ Evento recibido no es un mensaje de texto. Ignorando.");
                }
            }
        } catch (e: any) {
            console.error("\n🔥 Error crítico en el ciclo de polling:", e.message);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

pollUpdates();
