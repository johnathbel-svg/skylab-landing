/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    MessageSquareText,
    Users,
    ShieldCheck,
    Plus,
    Settings,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Search,
    ChevronRight,
    Command,
    ExternalLink,
    Zap
} from 'lucide-react'
import { OverviewCharts } from '@/components/dashboard/overview-charts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function DashboardPage() {
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

    let conversations: any[] = []
    let recentConversations: any[] = []
    let contactsCount = 0
    let closedConversations = 0

    if (tenantId) {
        // Parallelized Fetches for Maximum Performance
        const [convs, recent, contacts] = await Promise.all([
            supabase.from('conversations').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: true }),
            supabase.from('conversations').select('*, contacts(name, avatar_url)').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(5),
            supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId)
        ])

        if (convs.data) conversations = convs.data
        if (recent.data) recentConversations = recent.data
        contactsCount = contacts.count || 0
        closedConversations = conversations.filter(c => c.status === 'closed').length
    }

    const channelMap = conversations.reduce((acc, curr) => {
        const channel = curr.channel || 'web'
        acc[channel] = (acc[channel] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const channelData = Object.keys(channelMap).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: channelMap[key]
    }))

    const volumeMap = conversations.reduce((acc, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
        acc[date] = (acc[date] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const volumeData = Object.keys(volumeMap).map(date => ({
        date,
        count: volumeMap[date]
    }))

    const totalInteractions = conversations.length
    const efficiency = totalInteractions > 0 ? Math.round((closedConversations / totalInteractions) * 100) : 0

    const insights = [
        {
            title: "Crecimiento de Leads",
            desc: "Tu base de contactos creció un 12% esta semana.",
            type: "positive"
        },
        {
            title: "Optimización de Canal",
            desc: "El 80% de tus chats vienen de la Web.",
            type: "info"
        },
        {
            title: "Alerta de Eficiencia",
            desc: "Respuesta promedio subió 2min.",
            type: "warning"
        }
    ]

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#020617] relative">
            <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

            <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-slate-900 dark:bg-white rounded-2xl shadow-xl flex items-center justify-center text-white dark:text-slate-900">
                            <Command className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Command Center</h1>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocolo v3.2</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group hidden lg:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Buscar..."
                            className="w-48 pl-10 h-10 border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 focus-visible:bg-white transition-all text-xs"
                        />
                    </div>
                    <Link href="/dashboard/knowledge">
                        <Button size="sm" className="bg-indigo-600 text-white rounded-xl px-4 font-bold text-[10px] uppercase h-10 gap-2">
                            <Plus className="w-3 h-3" /> Nueva Fuente
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto w-full max-w-[1600px] mx-auto p-6 lg:p-10 space-y-6">
                {/* Master KPIs - Harmonized Bento Design */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ExecutiveKpi
                        label="Interacciones"
                        value={totalInteractions}
                        icon={<MessageSquareText className="w-4 h-4 text-indigo-500" />}
                        trend="+12%"
                        isUp={true}
                        color="indigo"
                    />
                    <ExecutiveKpi
                        label="Leads"
                        value={contactsCount}
                        icon={<Users className="w-4 h-4 text-emerald-500" />}
                        trend="+5.8%"
                        isUp={true}
                        color="emerald"
                    />
                    <ExecutiveKpi
                        label="Eficiencia"
                        value={`${efficiency}%`}
                        icon={<ShieldCheck className="w-4 h-4 text-amber-500" />}
                        trend="-1.2%"
                        isUp={false}
                        color="amber"
                    />
                    <ExecutiveKpi
                        label="Uptime"
                        value="99.9%"
                        icon={<Activity className="w-4 h-4 text-rose-500" />}
                        trend="Live"
                        isUp={true}
                        color="rose"
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                    <div className="xl:col-span-8 space-y-6">
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-1.5 shadow-xl shadow-slate-200/50 dark:shadow-none group overflow-hidden border-b-4 border-b-indigo-500/10">
                            <OverviewCharts volumeData={volumeData} channelData={channelData} />
                        </div>

                        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl border border-white/5">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {insights.map((insight, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-[28px] p-7 border border-white/5 transition-all hover:bg-white/10 hover:translate-y-[-4px]">
                                        <div className={`w-12 h-12 rounded-2xl mb-5 flex items-center justify-center border-2 border-white/10 ${insight.type === 'positive' ? 'bg-emerald-500/20' : insight.type === 'warning' ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}>
                                            {insight.type === 'positive' ? <ArrowUpRight className="text-emerald-400 w-5 h-5" /> : <Zap className="text-indigo-400 w-5 h-5" />}
                                        </div>
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-3">{insight.title}</h4>
                                        <p className="text-[14px] text-slate-200 font-bold leading-relaxed tracking-tight">"{insight.desc}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-4 flex flex-col gap-6">
                        <div className="bg-white dark:bg-white/5 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/60 dark:shadow-none overflow-hidden flex flex-col flex-1 min-h-[500px]">
                            <div className="p-7 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
                                <div>
                                    <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/20" /> Actividad Reciente
                                    </h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-Time Sync</p>
                                </div>
                                <Link href="/dashboard/conversations">
                                    <Button variant="ghost" size="sm" className="h-8 px-4 rounded-xl text-[9px] font-black uppercase bg-slate-100 dark:bg-white/10 hover:bg-indigo-600 hover:text-white transition-all">Ver Todo</Button>
                                </Link>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                                {recentConversations.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4">
                                        <MessageSquareText className="w-12 h-12" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Node Idle</p>
                                    </div>
                                ) : (
                                    recentConversations.map((conv) => (
                                        <div key={conv.id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/10 border border-transparent hover:border-slate-100 dark:hover:border-white/10 rounded-[24px] transition-all flex items-center gap-4 group/item cursor-pointer">
                                            <div className="w-11 h-11 rounded-1.5xl bg-slate-900 dark:bg-white border border-white/10 flex items-center justify-center text-xs font-black text-white dark:text-slate-900 shadow-lg group-hover/item:scale-105 transition-transform">
                                                {conv.contacts?.avatar_url ? <img src={conv.contacts.avatar_url} alt="" className="w-full h-full object-cover" /> : conv.contacts?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 truncate">
                                                <p className="text-[14px] font-black truncate text-slate-900 dark:text-white group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">{conv.contacts?.name || 'Usuario Autónomo'}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">{conv.channel || 'Direct Cloud'}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all">
                                                <ChevronRight className="w-4 h-4 text-indigo-500" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-indigo-600 rounded-[32px] p-9 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-white/20 transition-colors" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-7 flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-indigo-200" /> Puentes de Acceso
                            </h3>
                            <div className="grid grid-cols-1 gap-4 relative z-10">
                                <OperationLink href="/dashboard/bot-builder" label="Constructor Gen-3" icon={<Command className="w-4 h-4" />} />
                                <OperationLink href="/dashboard/integrations" label="Puente Omnicanal" icon={<Activity className="w-4 h-4" />} />
                                <OperationLink href="/dashboard/crm" label="Centro de Leads" icon={<Users className="w-4 h-4" />} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function ExecutiveKpi({ label, value, icon, trend, isUp, color }: any) {
    const tones: any = {
        indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    }

    return (
        <div className="bg-white dark:bg-white/5 rounded-[28px] p-5 border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none transition-all hover:translate-y-[-3px] group relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-inner ${tones[color]}`}>
                    {icon}
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest flex items-center gap-1 ${isUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    {isUp ? <ArrowUpRight className="w-2 h-2" /> : <ArrowDownRight className="w-2 h-2" />}
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{value}</h3>
            </div>
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/5 blur-2xl rounded-full group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
        </div>
    )
}

function OperationLink({ href, label, icon }: { href: string, label: string, icon: React.ReactNode }) {
    return (
        <Link href={href}>
            <div className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-[24px] transition-all group active:scale-95">
                <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                        {icon}
                    </div>
                    <span className="text-sm font-black text-white tracking-tight">{label}</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-all group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    )
}

