import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Briefcase, Activity, AlertTriangle, Key, DollarSign, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function ProvidersPage() {
    const supabase = await createClient()

    // 1. Obtener proveedores de la base de datos
    const { data: providers } = await supabase
        .from('provider_subscriptions')
        .select('*')
        .order('name')

    // Acción para simular recarga de costos
    async function updateProviderLimit(formData: FormData) {
        "use server"
        const supabase = await createClient()
        const id = formData.get('id') as string
        const limit = parseFloat(formData.get('limit') as string)

        await supabase
            .from('provider_subscriptions')
            .update({ spending_limit: limit, updated_at: new Date().toISOString() })
            .eq('id', id)

        revalidatePath('/super-admin/providers')
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <header className="flex flex-col gap-2">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                    Proveedores de API & Suscripciones <Briefcase className="w-6 h-6 text-emerald-400" />
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl">
                    Monitoreo y administración de llaves de API globales de LLMs (OpenAI, Anthropic, Gemini) y brokers de comunicación (Meta WhatsApp). Control de presupuestos y prevención de abusos.
                </p>
            </header>

            {/* Grid de Proveedores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers?.map((provider) => {
                    const percentage = Math.min(Math.round((provider.cost_this_month / (provider.spending_limit || 1)) * 100), 100)
                    const statusColor = provider.status === 'paused' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                        provider.status === 'warning' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                        'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'

                    const progressColor = percentage > 85 ? 'bg-rose-500' :
                        percentage > 60 ? 'bg-amber-500' :
                        'bg-emerald-500'

                    return (
                        <Card key={provider.id} className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl hover:border-slate-700/60 transition-all overflow-hidden relative group">
                            {/* Gradiente de fondo sutil */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
                                <div>
                                    <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                                        {provider.name}
                                    </CardTitle>
                                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">ID: {provider.id}</span>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                                    {provider.status}
                                </span>
                            </CardHeader>
                            <CardContent className="space-y-5 relative z-10">
                                {/* Datos de API y Llaves */}
                                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                                    <div className="space-y-1">
                                        <p className="text-slate-500 font-medium flex items-center gap-1"><Key className="w-3.5 h-3.5" /> API Key</p>
                                        <p className="font-mono text-slate-300 truncate">{provider.api_key_masked || 'No registrada'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-500 font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Corte de Ciclo</p>
                                        <p className="text-slate-300 font-semibold">{provider.billing_cycle_end ? new Date(provider.billing_cycle_end).toLocaleDateString('es-CO', {day: 'numeric', month: 'short'}) : 'N/D'}</p>
                                    </div>
                                </div>

                                {/* Consumo vs Límite */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end text-xs">
                                        <div className="space-y-0.5">
                                            <p className="text-slate-500 font-medium">Consumo Mensual</p>
                                            <p className="text-lg font-display font-bold text-white">${provider.cost_this_month} USD</p>
                                        </div>
                                        <div className="text-right space-y-0.5">
                                            <p className="text-slate-500 font-medium">Límite Permitido</p>
                                            <p className="text-sm font-semibold text-slate-300">${provider.spending_limit} USD</p>
                                        </div>
                                    </div>

                                    {/* Barra de progreso */}
                                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/40">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                                        <span>Consumido: {percentage}%</span>
                                        <span>Restante: ${(provider.spending_limit - provider.cost_this_month).toFixed(2)} USD</span>
                                    </div>
                                </div>

                                {/* Formulario para actualizar límites */}
                                <form action={updateProviderLimit} className="flex gap-2 items-center pt-2 border-t border-slate-800/40">
                                    <input type="hidden" name="id" value={provider.id} />
                                    <div className="flex-1 flex gap-2 items-center">
                                        <span className="text-xs text-slate-500 font-semibold flex items-center"><DollarSign className="w-3 h-3" /> Límite:</span>
                                        <input 
                                            aria-label="Límite en USD"
                                            type="number" 
                                            name="limit" 
                                            defaultValue={provider.spending_limit} 
                                            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500/50 w-24 font-mono"
                                            step="0.01"
                                        />
                                    </div>
                                    <Button type="submit" variant="outline" size="sm" className="border-slate-800 text-[11px] font-bold hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/40 px-3 h-8">
                                        Guardar Presupuesto
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}