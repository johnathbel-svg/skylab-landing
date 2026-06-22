import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Bot, MessageSquare, Activity, ShieldCheck, Search, ChevronRight, Database, AlertTriangle } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ActivityFeed } from '@/components/ui/activity-feed'
import { impersonateTenant } from './actions'

export const dynamic = 'force-dynamic'

export default async function SuperAdminDashboard() {
    const supabase = await createClient()

    // 1. Fetching Global Data
    const { count: tenantsCount } = await supabase.from('tenants').select('*', { count: 'exact', head: true })
    const { count: botsCount } = await supabase.from('bots').select('*', { count: 'exact', head: true })
    const { count: messagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true })

    // 2. Additional analytics fetches
    const { count: tenantsThisWeek } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const { data: conversationStats } = await supabase
        .rpc('get_conversations_by_status')

    const { data: planBreakdown } = await supabase
        .from('tenants')
        .select('subscription_plan, subscription_status')

    // JS grouping for plan breakdown
    const breakdown = planBreakdown?.reduce((acc: any, t: any) => {
        const plan = t.subscription_plan || 'starter'
        const status = t.subscription_status || 'active'
        acc.plans[plan] = (acc.plans[plan] || 0) + 1
        acc.status[status] = (acc.status[status] || 0) + 1
        return acc
    }, { plans: {} as any, status: {} as any }) ?? { plans: {}, status: {} }

    // Recent activity (latest 10 tenants and latest 10 bots)
    const { data: recentTenantActivity } = await supabase
        .from('tenants')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

    const { data: recentBotActivity } = await supabase
        .from('bots')
        .select('id, name, created_at, tenant_id, tenants(name)')
        .order('created_at', { ascending: false })
        .limit(10)

    // Merge activities
    const events: any[] = []
    if (recentTenantActivity) {
        recentTenantActivity.forEach((t: any) => {
            events.push({
                id: `tenant-${t.id}`,
                type: 'tenant_joined',
                label: `Nuevo inquilino registrado: ${t.name}`,
                sublabel: `ID: ${t.id}`,
                created_at: t.created_at
            })
        })
    }
    if (recentBotActivity) {
        recentBotActivity.forEach((b: any) => {
            const tenantName = (b.tenants as any)?.name || 'Desconocido'
            events.push({
                id: `bot-${b.id}`,
                type: 'bot_created',
                label: `Nuevo bot creado: ${b.name}`,
                sublabel: `Asignado a: ${tenantName}`,
                created_at: b.created_at
            })
        })
    }
    events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const recentEvents = events.slice(0, 20)

    // 3. Fetch Recent Tenants for Table
    const { data: recentTenants } = await supabase
        .from('tenants')
        .select('id, name, created_at, subscription_status, subscription_plan')
        .order('created_at', { ascending: false })
        .limit(10)

    // Fetch unresolved channel telemetry errors
    const { data: activeErrors } = await supabase
        .from('channel_errors')
        .select('*, tenants(name)')
        .eq('resolved', false)
        .order('created_at', { ascending: false })

    // Helper formatter
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                        System Operations <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Platform-wide overview and tenant administration</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 md:opacity-20"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-medium text-emerald-400 tracking-wide uppercase">All Services Operational</span>
                </div>
            </header>

            {/* Active Telemetry Alerts */}
            {activeErrors && activeErrors.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" /> Active Channel Alerts ({activeErrors.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeErrors.map((err: any) => (
                            <div 
                                key={err.id} 
                                className={`p-4 rounded-2xl border bg-slate-900/50 backdrop-blur-xl flex justify-between items-start gap-4 transition-all hover:bg-slate-900/80 ${err.severity === 'critical' ? 'border-rose-500/30 text-rose-200' : 'border-amber-500/20 text-amber-200'}`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${err.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {err.severity}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">Channel: <strong className="text-slate-300 capitalize">{err.channel}</strong></span>
                                    </div>
                                    <p className="text-sm font-semibold mt-1">{err.error_message}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Tenant: <span className="text-slate-400">{err.tenants?.name || 'Global'}</span> • {new Date(err.created_at).toLocaleTimeString()}</p>
                                </div>
                                <form action={async () => {
                                    "use server"
                                    const supabase = await createClient()
                                    await supabase.from('channel_errors').update({ resolved: true }).eq('id', err.id)
                                    revalidatePath('/super-admin')
                                }}>
                                    <button 
                                        type="submit" 
                                        className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-slate-700 bg-slate-950/50 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Resolve
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* KPI Cards (Bento Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl hover:bg-slate-900/60 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tenants</CardTitle>
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Users className="w-4 h-4 text-indigo-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-display font-bold text-white mb-1">{tenantsCount || 0}</div>
                        <p className="text-xs text-indigo-400/80 font-medium">+15% vs last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl hover:bg-slate-900/60 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Bots</CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Bot className="w-4 h-4 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-display font-bold text-white mb-1">{botsCount || 0}</div>
                        <p className="text-xs text-emerald-400/80 font-medium">Deployments operating</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl hover:bg-slate-900/60 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Messages</CardTitle>
                        <div className="p-2 bg-sky-500/10 rounded-lg">
                            <MessageSquare className="w-4 h-4 text-sky-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-display font-bold text-white mb-1">{messagesCount || 0}</div>
                        <p className="text-xs text-sky-400/80 font-medium">Inferences processed</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl hover:bg-slate-900/60 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">New This Week</CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Users className="w-4 h-4 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-display font-bold text-white mb-1">+{tenantsThisWeek || 0}</div>
                        <p className="text-xs text-amber-400/80 font-medium">New registrations</p>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Breakdown Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Plan Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/40 pb-2">
                            <span>Starter Plan</span>
                            <span className="font-mono text-white font-bold">{breakdown.plans.starter || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/40 pb-2">
                            <span>Growth Plan</span>
                            <span className="font-mono text-white font-bold">{breakdown.plans.growth || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 pb-1">
                            <span>Enterprise Plan</span>
                            <span className="font-mono text-white font-bold">{breakdown.plans.enterprise || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Tenant Subscription Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/40 pb-2">
                            <span>Active Clients</span>
                            <span className="font-mono text-white font-bold">{breakdown.status.active || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/40 pb-2">
                            <span>Trialing Users</span>
                            <span className="font-mono text-white font-bold">{breakdown.status.trialing || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 pb-1">
                            <span>Suspended / Canceled</span>
                            <span className="font-mono text-white font-bold">{breakdown.status.canceled || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Conversation Telemetry</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/40 pb-2">
                            <span>Open Conversations</span>
                            <span className="font-mono text-white font-bold">
                                {conversationStats?.find((c: any) => c.status === 'open')?.count || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/40 pb-2">
                            <span>Under Human Handoff</span>
                            <span className="font-mono text-white font-bold">
                                {conversationStats?.find((c: any) => c.status === 'handoff')?.count || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 pb-1">
                            <span>Closed / Archived</span>
                            <span className="font-mono text-white font-bold">
                                {conversationStats?.find((c: any) => c.status === 'closed')?.count || 0}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2/3 Column: Tenants Database Table */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden backdrop-blur-xl shadow-2xl">
                    {/* Table Toolbar */}
                    <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50">
                        <div>
                            <h3 className="text-lg font-bold text-white">Tenants Database</h3>
                            <p className="text-xs text-slate-400 mt-1">Manage and audit all client accounts</p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto overflow-hidden rounded-xl border border-slate-700/50 bg-slate-950/50 flex-1 sm:max-w-xs focus-within:border-indigo-500/50 transition-colors">
                            <div className="pl-3 py-2.5 flex items-center justify-center">
                                <Search className="w-4 h-4 text-slate-500" />
                            </div>
                            <input
                                aria-label="Search tenants"
                                type="text"
                                placeholder="Search by ID or Name..."
                                className="bg-transparent border-none text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-0 flex-1 py-2.5 pr-3"
                            />
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-[10px] font-black tracking-widest text-slate-500 uppercase bg-slate-950">
                                <tr>
                                    <th className="px-6 py-4">Tenant Identity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Subscription</th>
                                    <th className="px-6 py-4">Registration</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {recentTenants?.map(tenant => (
                                    <tr key={tenant.id} className="group hover:bg-indigo-500/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl border border-slate-700/50 bg-slate-800/50 flex items-center justify-center text-slate-300 font-bold uppercase">
                                                    {tenant.name.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">{tenant.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{tenant.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tenant.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                tenant.subscription_status === 'trialing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tenant.subscription_status === 'active' ? 'bg-emerald-400' :
                                                    tenant.subscription_status === 'trialing' ? 'bg-amber-400' : 'bg-rose-400'
                                                    }`} />
                                                {tenant.subscription_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <span className="capitalize font-medium">{tenant.subscription_plan}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs font-medium">
                                            {formatDate(tenant.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <form action={async () => {
                                                    "use server"
                                                    await impersonateTenant(tenant.id)
                                                }}>
                                                    <button
                                                        type="submit"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wide hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        Login As
                                                    </button>
                                                </form>
                                                <Link
                                                    href={`/super-admin/tenants/${tenant.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wide hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                >
                                                    Inspect <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {(!recentTenants || recentTenants.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-full mb-3">
                                                <Database className="w-6 h-6 text-slate-600" />
                                            </div>
                                            <p className="text-slate-400 font-medium">No tenants registered yet.</p>
                                            <p className="text-xs text-slate-500 mt-1">Users will appear here when they complete onboarding.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 1/3 Column: Platform Activity Feed */}
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl self-start">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                            <Activity className="w-5 h-5 text-indigo-400" /> Platform Activity Feed
                        </CardTitle>
                        <p className="text-xs text-slate-400">Real-time audit log of system events</p>
                    </CardHeader>
                    <CardContent>
                        <ActivityFeed events={recentEvents} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}