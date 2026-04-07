import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Bot, MessageSquare, Activity, ShieldCheck, Search, ChevronRight, Database } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SuperAdminDashboard() {
    const supabase = await createClient()

    // 1. Fetching Global Data (RLS is bypassed for this user via get_current_user_tenant_ids)
    const { count: tenantsCount } = await supabase.from('tenants').select('*', { count: 'exact', head: true })
    const { count: botsCount } = await supabase.from('bots').select('*', { count: 'exact', head: true })
    const { count: messagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true })

    // 2. Fetch Recent Tenants
    const { data: recentTenants } = await supabase
        .from('tenants')
        .select('id, name, created_at, subscription_status, subscription_plan')
        .order('created_at', { ascending: false })
        .limit(10)

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
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tokens</CardTitle>
                        <div className="p-2 bg-sky-500/10 rounded-lg">
                            <MessageSquare className="w-4 h-4 text-sky-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-display font-bold text-white mb-1">{messagesCount || 0}</div>
                        <p className="text-xs text-sky-400/80 font-medium">Inferences processed</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl hover:bg-slate-900/60 transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">System Load</CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Activity className="w-4 h-4 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-display font-bold text-white mb-1">12<span className="text-xl text-slate-500">%</span></div>
                        <p className="text-xs text-amber-400/80 font-medium">Optimal capability</p>
                    </CardContent>
                </Card>
            </div>

            {/* Premium Data Table */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden backdrop-blur-xl shadow-2xl">
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
                                        <Link
                                            href={`/super-admin/tenants/${tenant.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wide hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                        >
                                            Inspect <ChevronRight className="w-4 h-4" />
                                        </Link>
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
        </div>
    )
}
