import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, RefreshCw, BarChart3, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { syncFinancesWithGoogleSheets } from './actions'

export const dynamic = 'force-dynamic'

export default async function FinancesPage() {
    const supabase = await createClient()

    // 1. Obtener transacciones financieras locales
    const { data: transactions } = await supabase
        .from('finance_transactions')
        .select('*')
        .order('date', { ascending: false })

    // 2. Calcular agregados
    let totalIncome = 0
    let totalExpense = 0

    if (transactions) {
        transactions.forEach((tx) => {
            const amount = Number(tx.amount)
            if (tx.type === 'income') {
                totalIncome += amount
            } else {
                totalExpense += amount
            }
        })
    }

    const netProfit = totalIncome - totalExpense
    const margin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0

    // Formateadores locales
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                        Control Financiero <TrendingUp className="w-6 h-6 text-sky-400" />
                    </h2>
                    <p className="text-slate-400 text-sm max-w-xl">
                        Seguimiento en tiempo real de ingresos y egresos de Synerg-IA, sincronizado con el Google Sheet corporativo.
                    </p>
                </div>

                {/* Botón de Sincronización */}
                <form action={async () => {
                    "use server"
                    await syncFinancesWithGoogleSheets()
                }}>
                    <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl border border-sky-400/20 shadow-lg flex items-center gap-2 transition-all">
                        <RefreshCw className="w-4 h-4" /> Sincronizar Google Sheets
                    </Button>
                </form>
            </header>

            {/* Tarjetas KPI Financieras (Bento Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Ingresos</CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-display font-bold text-white mb-1">{formatCurrency(totalIncome)}</div>
                        <p className="text-xs text-emerald-400/80 font-medium">Facturación bruta</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Egresos</CardTitle>
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                            <ArrowDownRight className="w-4 h-4 text-rose-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-display font-bold text-white mb-1">{formatCurrency(totalExpense)}</div>
                        <p className="text-xs text-rose-400/80 font-medium">Costos operativos & APIs</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Balance Neto</CardTitle>
                        <div className="p-2 bg-sky-500/10 rounded-lg">
                            <DollarSign className="w-4 h-4 text-sky-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-display font-bold mb-1 ${netProfit >= 0 ? 'text-white' : 'text-rose-400'}`}>
                            {formatCurrency(netProfit)}
                        </div>
                        <p className="text-xs text-sky-400/80 font-medium">Rentabilidad disponible</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Margen Comercial</CardTitle>
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <BarChart3 className="w-4 h-4 text-indigo-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-display font-bold text-white mb-1">{margin}%</div>
                        <p className="text-xs text-indigo-400/80 font-medium">Eficiencia comercial</p>
                    </CardContent>
                </Card>
            </div>

            {/* Listado de Transacciones */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden backdrop-blur-xl shadow-2xl">
                <div className="p-6 border-b border-slate-800/60 bg-slate-900/50">
                    <h3 className="text-lg font-bold text-white">Historial de Transacciones Sincronizadas</h3>
                    <p className="text-xs text-slate-400 mt-1">Lista completa de ingresos y gastos importados del corporativo</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-[10px] font-black tracking-widest text-slate-500 uppercase bg-slate-950">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Descripción</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {transactions?.map((tx) => (
                                <tr key={tx.id} className="group hover:bg-slate-900/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                        {formatDate(tx.date)}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-200 truncate max-w-xs">
                                        {tx.description}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-xs">
                                        {tx.category || 'General'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            tx.type === 'income' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        }`}>
                                            {tx.type === 'income' ? 'Ingreso' : 'Egreso'}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono font-bold text-xs ${
                                        tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                                    </td>
                                </tr>
                            ))}

                            {(!transactions || transactions.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-full mb-3">
                                            <Database className="w-6 h-6 text-slate-600" />
                                        </div>
                                        <p className="text-slate-400 font-medium">Sin transacciones registradas.</p>
                                        <p className="text-xs text-slate-500 mt-1">Presiona "Sincronizar Google Sheets" para importar la contabilidad.</p>
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