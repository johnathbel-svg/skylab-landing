/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FlaskConical, Gauge, Sparkles } from 'lucide-react'
import { BotChat } from '@/components/dashboard/bot-chat'

export default async function BotTesterPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { getActiveTenantId } = await import('@/utils/supabase/server')
    const tenantId = await getActiveTenantId()

    let bots: any[] = []
    if (tenantId) {
        const { data: botsData } = await supabase
            .from('bots')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })

        if (botsData) bots = botsData
    }

    return (
        <div className="relative flex flex-1 flex-col overflow-hidden bg-background p-4 md:p-6">
            <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[520px] bg-[#00B4DB]/5 blur-[120px]" />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1500px] min-h-0 flex-col gap-4">
                <div className="flex shrink-0 flex-col gap-3 border-b border-white/10 pb-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="min-w-0">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00B4DB]/20 bg-[#00B4DB]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#00B4DB]">
                            <FlaskConical className="h-3 w-3" /> Laboratorio de simulacion
                        </div>
                        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                            <h1 className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">
                                Bot Tester
                            </h1>
                            <p className="max-w-2xl pb-1 text-sm font-medium leading-relaxed text-[#A6B3C4]">
                                Prueba la personalidad de tu agente en simuladores de canal sin salir de una sola consola.
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#7E8A9C]">
                            <Gauge className="h-3.5 w-3.5 text-emerald-400" /> ~234ms
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#7E8A9C]">
                            <Sparkles className="h-3.5 w-3.5 text-[#00B4DB]" /> Minimal
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1">
                    <BotChat bots={bots} />
                </div>
            </div>
        </div>
    )
}
