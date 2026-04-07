import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertTriangle, Power, Globe, ZapOff, Activity, ShieldCheck, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function MetricsAndControlsPage() {

    // In a real prod scenario, we'll keep global system state in a Redis cache or a specific 'system_config' table.
    // For this build, we mock the current state toggle visuals.
    const isWhatsappGatewayActive = true
    const isWebWidgetActive = true
    const isInferenceEngineActive = true

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <header className="flex flex-col gap-2">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                    System Controls & Security <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl">
                    High-level architectural emergency controls. Modifying these settings overrides local tenant configurations and affects the global operational status of Skylab Human Bot.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-slate-900/40 border-rose-500/20 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-rose-500/5 rounded-bl-full pointer-events-none" />
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-xl">
                                <AlertTriangle className="w-5 h-5 text-rose-500" /> Global Kill Switches
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Disconnect channels globally in case of massive DDOS attacks or upstream API failures.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Switch 1 */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 transition-colors hover:border-slate-700/60">
                                <div className="flex gap-4 items-start sm:items-center mb-4 sm:mb-0">
                                    <div className="p-3 bg-indigo-500/10 rounded-lg shrink-0">
                                        <Globe className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-200">Web Widget Gateway</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Pause all incoming traffic from embedded website iframes.</p>
                                    </div>
                                </div>
                                <Button variant="outline" className={`shrink-0 border-rose-500/50 hover:bg-rose-500 hover:text-white transition-all ${isWebWidgetActive ? 'text-rose-400' : 'bg-rose-500 text-white'}`}>
                                    <Power className="w-4 h-4 mr-2" /> {isWebWidgetActive ? 'Disable Gateway' : 'Enable Gateway'}
                                </Button>
                            </div>

                            {/* Switch 2 */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 transition-colors hover:border-slate-700/60">
                                <div className="flex gap-4 items-start sm:items-center mb-4 sm:mb-0">
                                    <div className="p-3 bg-emerald-500/10 rounded-lg shrink-0">
                                        <MessageSquare className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-200">WhatsApp / Meta Broker</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Disconnect Meta Webhooks. Outbound messages will fail.</p>
                                    </div>
                                </div>
                                <Button variant="outline" className={`shrink-0 border-rose-500/50 hover:bg-rose-500 hover:text-white transition-all ${isWhatsappGatewayActive ? 'text-rose-400' : 'bg-rose-500 text-white'}`}>
                                    <ZapOff className="w-4 h-4 mr-2" /> {isWhatsappGatewayActive ? 'Sever Connection' : 'Restore Connection'}
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* Status Column */}
                <div className="space-y-6">
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Activity className="w-5 h-5 text-sky-400" /> Subsystems
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Gemini Inference Engine</span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ALIVE
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Postgres RAG Vector Store</span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ALIVE
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Supabase Edge Network</span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ALIVE
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
