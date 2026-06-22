import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, DollarSign, Calendar, MessageSquare, ArrowRight, UserPlus, Info, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

const statuses = [
    { key: 'lead', label: 'Leads / Prospectos', color: 'border-sky-500/30 text-sky-400 bg-sky-500/5' },
    { key: 'contacted', label: 'Contactados', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5' },
    { key: 'trial', label: 'Prueba de Concepto', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5' },
    { key: 'active_customer', label: 'Clientes Activos', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
    { key: 'churned', label: 'Churn / Perdidos', color: 'border-rose-500/30 text-rose-400 bg-rose-500/5' }
]

export default async function CRMPage() {
    const supabase = await createClient()

    // 1. Obtener todos los tenants
    const { data: tenants } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false })

    // Server Action para cambiar el estado comercial
    async function updateLeadStatus(formData: FormData) {
        "use server"
        const supabase = await createClient()
        const tenantId = formData.get('tenantId') as string
        const nextStatus = formData.get('nextStatus') as string

        await supabase
            .from('tenants')
            .update({ 
                lead_status: nextStatus,
                updated_at: new Date().toISOString() 
            })
            .eq('id', tenantId)

        revalidatePath('/super-admin/crm')
    }

    // Agrupar inquilinos por estado
    const grouped = tenants?.reduce((acc: any, t: any) => {
        const status = t.lead_status || 'lead'
        if (!acc[status]) acc[status] = []
        acc[status].push(t)
        return acc
    }, {} as any) ?? {}

    // Formateadores
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <header className="flex flex-col gap-2">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                    SaaS CRM de Clientes <Users className="w-6 h-6 text-amber-400" />
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl">
                    Gestión del pipeline de ventas de Skylab. Administra prospectos, acompaña pruebas de concepto y monitorea renovaciones de contratos.
                </p>
            </header>

            {/* Tablero Kanban */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
                {statuses.map((status) => {
                    const list = grouped[status.key] || []

                    return (
                        <div key={status.key} className="flex flex-col space-y-4 min-w-[250px] bg-slate-900/10 border border-slate-800/40 p-4 rounded-2xl backdrop-blur-md">
                            <div className={`flex items-center justify-between p-3 rounded-xl border font-bold text-xs uppercase tracking-wider ${status.color}`}>
                                <span>{status.label}</span>
                                <span className="font-mono bg-slate-950/40 px-2 py-0.5 rounded border border-white/5">{list.length}</span>
                            </div>

                            <div className="flex-1 space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                                {list.map((tenant: any) => {
                                    // Determinar el siguiente estado comercial lógico para moverlo
                                    const nextStatuses = {
                                        'lead': 'contacted',
                                        'contacted': 'trial',
                                        'trial': 'active_customer',
                                        'active_customer': 'churned',
                                        'churned': 'lead'
                                    } as Record<string, string>

                                    const next = nextStatuses[status.key]

                                    return (
                                        <Card key={tenant.id} className="bg-slate-900/40 border-slate-800/60 hover:border-slate-700/60 transition-all shadow-md group">
                                            <CardContent className="p-4 space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-bold text-white truncate">{tenant.name}</h4>
                                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{tenant.id}</p>
                                                </div>

                                                <div className="space-y-1.5 text-xs text-slate-400">
                                                    <div className="flex justify-between">
                                                        <span>Industria:</span>
                                                        <span className="text-slate-200 capitalize font-medium">{tenant.industry || 'No especificada'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Valor Estimado:</span>
                                                        <span className="text-slate-200 font-semibold font-mono">{formatCurrency(tenant.estimated_value || 0)}</span>
                                                    </div>
                                                </div>

                                                {tenant.next_followup_date && (
                                                    <div className="flex items-center gap-1.5 text-[10px] bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-2 text-indigo-400 font-medium">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>Seguimiento: {new Date(tenant.next_followup_date).toLocaleDateString('es-CO')}</span>
                                                    </div>
                                                )}

                                                {/* Botón para mover de estado */}
                                                <form action={updateLeadStatus}>
                                                    <input type="hidden" name="tenantId" value={tenant.id} />
                                                    <input type="hidden" name="nextStatus" value={next} />
                                                    <Button 
                                                        type="submit" 
                                                        variant="ghost" 
                                                        className="w-full h-8 justify-between text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all rounded-lg"
                                                    >
                                                        <span>Avanzar Estado</span>
                                                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    )
                                })}

                                {list.length === 0 && (
                                    <div className="text-center py-12 border border-dashed border-slate-800/40 rounded-xl bg-slate-950/10 text-slate-600 text-xs italic">
                                        Vacío
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}