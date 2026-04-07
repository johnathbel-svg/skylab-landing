import { Metadata } from 'next'
import BotChatWidget from './bot-chat-widget'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
    title: '💬 Chat Externo - Skylab',
    description: 'Skylab Human Bot Widget',
}

export default async function WidgetPage({
    params
}: {
    params: { botId: string }
}) {
    // Validar botId en Supabase
    const supabase = await createClient()
    const { data: bot, error } = await supabase
        .from('bots')
        .select('id, name, avatar_url, color_theme, welcome_message, tenant_id')
        .eq('id', params.botId)
        .single()

    if (error || !bot) {
        console.error("Widget Load Error:", error)
        notFound()
    }

    return (
        <main className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden m-0 p-0 antialiased relative">
            {/* Header del Widget */}
            {/* eslint-disable-next-line react/no-unknown-property */}
            <div
                className="h-16 shrink-0 shadow-sm flex items-center justify-between px-4 z-10"
                /* eslint-disable-next-line react-inline-style/no-inline-styles */
                style={{ backgroundColor: bot.color_theme || '#4f46e5' }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center p-1 overflow-hidden backdrop-blur-sm">
                        {bot.avatar_url ? (
                            <img src={bot.avatar_url} alt={bot.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span className="text-white font-bold text-lg">{bot.name.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-[15px] leading-tight flex items-center gap-2">
                            {bot.name}
                            <span className="w-2 h-2 rounded-full bg-emerald-400 border border-white inline-block animate-pulse"></span>
                        </h2>
                        <p className="text-white/80 text-xs font-medium">Asesor Humano Activo</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        // Se comunica con el script public/widget.js para cerrar el iframe
                        window.parent.postMessage({ type: 'skylab-close-widget' }, '*');
                    }}
                    type="button"
                    aria-label="Cerrar chat"
                    title="Cerrar chat"
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                </button>
            </div>

            {/* Area Principal de Chat: Instanciamos el Chat adaptado */}
            <div className="flex-1 w-full relative overflow-hidden bg-white">
                <BotChatWidget initialBot={bot} />
            </div>

            {/* Marca de agua sutil */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02]">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 5.91 2 10.74C2 13.04 3.03 15.13 4.7 16.7C4.46 18.06 3.61 19.34 2.14 20.3C2.1 20.33 2.06 20.37 2.04 20.41C1.96 20.53 1.95 20.68 2.01 20.81C2.07 20.93 2.19 21.01 2.32 21.01C4.44 21.01 6.3 20.17 7.7 18.81C9 19.16 10.45 19.38 12 19.38C17.52 19.38 22 15.47 22 10.64C22 5.82 17.52 1.91 12 1.91V2Z" />
                </svg>
            </div>
        </main>
    )
}
