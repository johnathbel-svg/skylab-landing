import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Calendar, CreditCard, Ban, ShieldAlert, Edit, Save, Play, Activity, Bot } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { suspendTenant, resumeTenant, forceUpdateSubscription, impersonateTenant } from '../../actions'
import { TenantUsageChart } from '@/components/ui/tenant-usage-chart'

export const dynamic = 'force-dynamic'

export default async function TenantDetailView({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const supabase = await createClient()

    // 1. Validar Seguridad (Super Admin check implicito en el Layout o Middleware, pero re-aseguramos la lectura global)
    // El RLS ya sabe que somos SuperAdmin gracias a `is_super_admin()`

    // 2. Traer info del Tenant
    const { data: tenant, error: tenantErr } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

    if (tenantErr || !tenant) {
        notFound()
    }

    // 3. Info de los usuarios dueños/miembros de ese Tenant
    const { data: members } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .eq('tenant_id', tenant.id)

    // 4. Fetch bots + conversations + messages
    const { data: tenantBots } = await supabase
        .from('bots')
        .select('id, name, tone_style, created_at, conversations(count)')
        .eq('tenant_id', tenant.id)

    const { data: convStats } = await supabase
        .from('conversations')
        .select('id, status, bot_id')
        .eq('tenant_id', tenant.id)

    const { data: messagesForTenant } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('tenant_id', tenant.id)

    // Count messages per bot in JS
    const botMessageCounts: Record<string, number> = {}
    if (messagesForTenant && convStats) {
        messagesForTenant.forEach(msg => {
            const conv = convStats.find(c => c.id === msg.conversation_id)
            if (conv && conv.bot_id) {
                botMessageCounts[conv.bot_id] = (botMessageCounts[conv.bot_id] || 0) + 1
            }
        })
    }

    // Group conversations by status
    const groupedConvs = convStats?.reduce((acc: any, c: any) => {
        const s = c.status || 'open'
        acc[s] = (acc[s] || 0) + 1
        return acc
    }, { open: 0, closed: 0, handoff: 0 } as any) ?? { open: 0, closed: 0, handoff: 0 }

    // Fetch message telemetry for the chart
    const { data: usageData } = await supabase
        .rpc('get_tenant_messages_by_day', { p_tenant_id: tenant.id, days: 30 })

    const chartData = usageData?.map((r: any) => ({
        day: r.day,
        count: Number(r.count)
    })) ?? []

    // ROI / Token Cost calculations
    const getPlanPrice = (plan: string) => {
        switch (plan?.toLowerCase()) {
            case 'starter': return 49.00
            case 'growth': return 149.00
            case 'enterprise': return 499.00
            default: return 49.00
        }
    }

    const totalMessages = messagesForTenant?.length || 0
    const estimatedTokenCost = totalMessages * 0.002
    const planPrice = getPlanPrice(tenant.subscription_plan)
    const netProfit = planPrice - estimatedTokenCost
    const roiMargin = planPrice > 0 ? (netProfit / planPrice) * 100 : 0
    const isHighCost = (estimatedTokenCost / planPrice) >= 0.8;

    // Formatear Fecha
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    // Determinar estilo de Badge de Estatus
    const isSuspended = tenant.subscription_status === 'canceled'
    const statusColor = isSuspended ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
        : tenant.subscription_status === 'trialing' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out max-w-5xl mx-auto">

            {/* Nav & Header */}
            <div className="flex flex-col gap-4 mb-8">
                <Link href="/super-admin" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors w-fit group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Operations
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-display font-bold text-white tracking-tight">{tenant.name}</h2>
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${statusColor}`}>
                                {tenant.subscription_status}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-mono">{tenant.id}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Columna Principal - Detalles */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-400" /> Organization Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500">Created On</p>
                                    <p className="text-base text-slate-200">{formatDate(tenant.created_at)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500">Billing Plan</p>
                                    <p className="text-base text-slate-200 capitalize">{tenant.subscription_plan} Tier</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800/60">
                                <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Registered Identity Nodes (Members)
                                </h4>
                                {members && members.length > 0 ? (
                                    <div className="space-y-2">
                                        {members.map(member => (
                                            <div key={member.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                                                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-mono text-slate-300">{member.user_id}</p>
                                                    </div>
                                                </div>
                                                <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-indigo-500/10 text-indigo-400 rounded w-fit">
                                                    {member.role}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No assigned members found in user_roles table.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ROI & Cost Telemetry Dashboard */}
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl hover:bg-slate-900/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-indigo-400" /> ROI & Token Cost Telemetry
                                </span>
                                <span className={`text-xs px-2.5 py-1 rounded-lg font-mono ${isHighCost ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                    Margin: ${roiMargin.toFixed(1)}%
                                </span>
                            </CardTitle>
                            <CardDescription className="text-slate-400">Comparing tenant monthly subscription against active LLM inference costs</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isHighCost && (
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 text-rose-400 animate-pulse">
                                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-sm">High Token Cost Warning</h4>
                                        <p className="text-xs text-rose-400/80 mt-1">
                                            This tenant's API consumption represents ${((estimatedTokenCost / planPrice) * 100).toFixed(1)}% of their subscription plan value. Recommend plan upgrade.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Subscription Income</span>
                                    <div className="text-xl font-bold text-slate-200 mt-1">${planPrice.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">/mo</span></div>
                                </div>
                                <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Estimated LLM Cost</span>
                                    <div className="text-xl font-bold text-rose-400 mt-1">${estimatedTokenCost.toFixed(3)}</div>
                                </div>
                                <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Net Margin (ROI)</span>
                                    <div className={`text-xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        ${netProfit.toFixed(3)}
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar of API Cost vs Subscription */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                    <span className="text-slate-400">LLM Resource Allocation</span>
                                    <span className={isHighCost ? 'text-rose-400' : 'text-indigo-400'}>
                                        ${((estimatedTokenCost / planPrice) * 100).toFixed(1)}% limit reached
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-550 ${isHighCost ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'}`}
                                        style={{ width: `${Math.min((estimatedTokenCost / planPrice) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                    <span>$0.00</span>
                                    <span>Quota limit: ${(planPrice * 0.8).toFixed(2)} (80%)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Session Stats */}
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                                <Activity className="w-5 h-5 text-indigo-400" /> Active Session Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-indigo-400">{groupedConvs.open}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">Open</div>
                                </div>
                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-emerald-400">{groupedConvs.closed}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">Closed</div>
                                </div>
                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-amber-400">{groupedConvs.handoff}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">Handoff</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Running AI Bots */}
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                                <Bot className="w-5 h-5 text-emerald-400" /> Running AI Bots
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            {tenantBots && tenantBots.length > 0 ? (
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="text-[10px] font-black tracking-widest text-slate-500 uppercase border-b border-slate-800/60">
                                        <tr>
                                            <th className="pb-3 pr-4">Name</th>
                                            <th className="pb-3 pr-4">Tone Style</th>
                                            <th className="pb-3 pr-4 text-center">Conversations</th>
                                            <th className="pb-3 pr-4 text-center">Messages</th>
                                            <th className="pb-3 text-right">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40">
                                        {tenantBots.map((bot: any) => (
                                            <tr key={bot.id} className="text-slate-300">
                                                <td className="py-3 pr-4 font-semibold text-white">{bot.name}</td>
                                                <td className="py-3 pr-4 capitalize text-xs">{bot.tone_style || 'professional'}</td>
                                                <td className="py-3 pr-4 text-center font-mono text-xs">{bot.conversations?.[0]?.count ?? bot.conversations?.count ?? 0}</td>
                                                <td className="py-3 pr-4 text-center font-mono text-xs">{botMessageCounts[bot.id] || 0}</td>
                                                <td className="py-3 text-right text-xs text-slate-500">{new Date(bot.created_at).toLocaleDateString('es-CO')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-sm text-slate-500 italic text-center py-4">No active bots configured for this tenant.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rendering the Recharts Metrics Component */}
                    <TenantUsageChart data={chartData} />
                </div>

                {/* Columna Lateral - Acciones Maestras */}
                <div className="space-y-6">
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-amber-500" /> Master Controls
                            </CardTitle>
                            <CardDescription className="text-slate-400">Override tenant settings. Use with caution.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form action={async () => {
                                "use server"
                                await impersonateTenant(tenant.id)
                            }} className="w-full">
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl border border-indigo-500/20 transition-all cursor-pointer mb-2"
                                >
                                    <User className="w-4 h-4" /> Impersonate Tenant (Login As)
                                </button>
                            </form>
                            {!isSuspended ? (
                                <form action={async () => {
                                    "use server"
                                    await suspendTenant(tenant.id)
                                }} className="w-full">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl border border-rose-500/20 transition-all"
                                    >
                                        <Ban className="w-4 h-4" /> Suspend Organization
                                    </button>
                                    <p className="text-[10px] text-slate-500 text-center mt-2 leading-relaxed">
                                        This will immediately lock all users associated with this tenant out of the Skylab Dashboard and disable runtime bots.
                                    </p>
                                </form>
                            ) : (
                                <form action={async () => {
                                    "use server"
                                    await resumeTenant(tenant.id)
                                }} className="w-full">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all"
                                    >
                                        <Play className="w-4 h-4" /> Revoke Suspension
                                    </button>
                                </form>
                            )}

                            <div className="h-px bg-slate-800/60 my-4" />

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Force Subscription Update</label>
                                <form action={async (formData) => {
                                    "use server"
                                    await forceUpdateSubscription(tenant.id, formData)
                                }} className="flex gap-2">
                                    <select
                                        name="plan"
                                        className="bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2 flex-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                                        defaultValue={tenant.subscription_plan}
                                        aria-label="Select Subscription Plan"
                                    >
                                        <option value="starter">Starter</option>
                                        <option value="growth">Growth</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                    <Button type="submit" size="icon" variant="outline" className="border-slate-700 bg-slate-950 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/50">
                                        <Save className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>

                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}