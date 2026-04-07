/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MessageSquareText, Search, Clock, Bot, TrendingUp, CheckCircle2, User, Sparkles, Filter, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SeedDataButton } from "@/components/ui/seed-data-button"

export default async function ConversationsPage() {
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
    if (tenantId) {
        const { data: convData, error } = await supabase
            .from('conversations')
            .select('*, contacts(name, email, phone_number), bots(name)')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })

        if (!error && convData) {
            conversations = convData
        }
    }

    const activeChats = conversations.filter(c => c.status === 'open').length
    const resolvedChats = conversations.filter(c => c.status === 'closed').length
    const engagementRate = conversations.length > 0 ? Math.round((resolvedChats / conversations.length) * 100) : 0

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#020617] relative">
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

            <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-slate-900 dark:bg-white rounded-2xl shadow-xl flex items-center justify-center text-white dark:text-slate-900">
                            <MessageSquareText className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Bandeja de Entrada</h1>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles className="w-2 h-2 text-emerald-400" /> Protocolo de Respuesta Activo
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mr-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{activeChats} Chats Operativos</span>
                    </div>
                    <Button variant="ghost" size="sm" className="hidden border-white/10 text-[10px] font-black uppercase h-10 px-4 rounded-xl gap-2 hover:bg-slate-100 dark:hover:bg-white/5">
                        <Filter className="w-3 h-3" /> Filtrar
                    </Button>
                    <Button size="sm" className="bg-emerald-600 text-white rounded-xl px-4 font-bold text-[10px] uppercase h-10 gap-2">
                        + Nuevo Ticket
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto w-full max-w-[1600px] mx-auto p-6 lg:p-10 space-y-8 relative z-10">
                {/* Stats Grid Compact */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MiniKpi label="Total Historico" value={conversations.length} color="indigo" />
                    <MiniKpi label="En Curso" value={activeChats} color="emerald" pulse />
                    <MiniKpi label="Resueltos" value={resolvedChats} color="sky" />
                    <MiniKpi label="Contención" value={`${engagementRate}%`} color="rose" />
                </div>

                {/* Main Table Content */}
                <div className="bg-white dark:bg-white/5 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden group">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-transparent border-b border-slate-100 dark:border-white/5">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="font-black text-slate-400 dark:text-slate-500 h-14 uppercase text-[10px] tracking-widest pl-8">Estado / ID</TableHead>
                                <TableHead className="font-black text-slate-400 dark:text-slate-500 h-14 uppercase text-[10px] tracking-widest">Cliente</TableHead>
                                <TableHead className="font-black text-slate-400 dark:text-slate-500 h-14 uppercase text-[10px] tracking-widest">IA Asignada</TableHead>
                                <TableHead className="font-black text-slate-400 dark:text-slate-500 h-14 uppercase text-[10px] tracking-widest">Vía</TableHead>
                                <TableHead className="font-black text-slate-400 dark:text-slate-500 h-14 uppercase text-[10px] tracking-widest text-right pr-8">Cronología</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {conversations.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableCell colSpan={5} className="h-[400px] text-center">
                                        <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
                                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[32px] flex items-center justify-center">
                                                <MessageSquareText className="w-10 h-10 text-slate-300 dark:text-white/20" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Cero Intercepciones</p>
                                                <p className="text-xs text-slate-400 font-medium font-mono uppercase">Protocolo de escucha activo...</p>
                                            </div>
                                            <SeedDataButton className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl px-8 h-12" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                conversations.map((conv) => (
                                    <TableRow key={conv.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group cursor-pointer h-24">
                                        <TableCell className="pl-8">
                                            <div className="flex flex-col gap-2">
                                                <Badge className={`capitalize inline-flex w-max font-black text-[9px] tracking-widest shadow-none px-3 py-1 border-none rounded-full ${conv.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                    {conv.status === 'open' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />}
                                                    {conv.status}
                                                </Badge>
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1">#{conv.id.substring(0, 8)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-white border border-white/10 flex items-center justify-center text-white dark:text-slate-900 text-xs font-black">
                                                    {(conv.contacts?.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-500 transition-colors">
                                                        {conv.contacts?.name || 'Usuario Autónomo'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        {conv.contacts?.phone_number || conv.contacts?.email || 'Desconocido'}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 bg-indigo-500/10 dark:bg-white/5 border border-indigo-500/20 dark:border-white/10 px-3 py-1.5 rounded-xl w-max">
                                                <Bot className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-widest">
                                                    {conv.bots?.name || 'Core Engine'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-white/20" />
                                                <span className="text-[10px] font-black capitalize text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                    {conv.channel}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <div className="flex items-center justify-end gap-4">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-slate-900 dark:text-white text-xs font-black">
                                                        {new Date(conv.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        {new Date(conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-white/10 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    )
}

function MiniKpi({ label, value, color, pulse }: any) {
    const tones: any = {
        indigo: "text-indigo-500 bg-indigo-500/10",
        emerald: "text-emerald-500 bg-emerald-500/10",
        sky: "text-sky-500 bg-sky-500/10",
        rose: "text-rose-500 bg-rose-500/10",
    }
    return (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-[32px] flex items-center justify-between group transition-all hover:bg-slate-50 dark:hover:bg-white/[0.08]">
            <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{value}</h3>
                    {pulse && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                </div>
            </div>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all ${tones[color]}`}>
                <TrendingUp className="w-4 h-4" />
            </div>
        </div>
    )
}
