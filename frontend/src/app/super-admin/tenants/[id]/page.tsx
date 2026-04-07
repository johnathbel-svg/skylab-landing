import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Calendar, CreditCard, Ban, ShieldAlert, Edit, Save, Play, Activity } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { suspendTenant, resumeTenant, forceUpdateSubscription } from '../../actions'
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

                    {/* Rendering the Recharts Metrics Component */}
                    <TenantUsageChart />
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
