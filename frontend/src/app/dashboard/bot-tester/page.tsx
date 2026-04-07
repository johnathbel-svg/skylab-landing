/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FlaskConical, Command, Search, Sparkles } from 'lucide-react'
import { BotChat } from '@/components/dashboard/bot-chat'

export default async function BotTesterPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: roleData } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .maybeSingle()

    const tenantId = roleData?.tenant_id

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
        <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#020617] relative">
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

            <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-slate-900 dark:bg-white rounded-2xl shadow-xl flex items-center justify-center text-white dark:text-slate-900">
                            <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Bot Lab</h1>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles className="w-2 h-2 text-purple-400" /> Entorno de Pruebas Gen-3
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Motor RAG Optimizado</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto w-full max-w-[1200px] mx-auto p-6 lg:p-10 space-y-8 relative z-10">
                <div className="bg-white dark:bg-white/5 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden min-h-[600px] flex flex-col group transition-all hover:border-purple-500/20">
                    <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
                        <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">Simulador de Diálogo</h2>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Inicia una Interacción Estelar</h3>
                    </div>

                    <div className="flex-1 p-4 lg:p-8 flex items-start justify-center">
                        <div className="w-full">
                            <BotChat bots={bots} />
                        </div>
                    </div>
                </div>

                {/* Footer Insight for Lab */}
                <div className="flex justify-center gap-12 opacity-30 mt-8">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <Command className="w-3 h-3" /> Latencia de Respuesta: ~234ms
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <Sparkles className="w-3 h-3" /> Nivel de Alucinación: Minimal
                    </div>
                </div>
            </main>
        </div>
    )
}
