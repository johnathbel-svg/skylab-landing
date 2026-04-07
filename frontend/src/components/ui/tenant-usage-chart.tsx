/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity } from 'lucide-react'

// Dummy Data (In a real scenario, this would come pre-aggregated from RPC or grouped by dates)
const defaultData = [
    { date: 'Oct', tokens: 4000, interactions: 240 },
    { date: 'Nov', tokens: 3000, interactions: 139 },
    { date: 'Dec', tokens: 2000, interactions: 980 },
    { date: 'Jan', tokens: 2780, interactions: 390 },
    { date: 'Feb', tokens: 1890, interactions: 480 },
    { date: 'Mar', tokens: 8390, interactions: 1200 }, // Spike detected
]

// Custom Tooltip para el estilo oscuro de Skylab extraído fuera para evitar re-renders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl shrink-0 text-sm">
                <p className="text-white font-bold mb-2">{label}</p>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <p className="text-slate-300">Tokens: <span className="font-mono text-white">{payload[0].value}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-slate-300">Requests: <span className="font-mono text-white">{payload[1]?.value || 0}</span></p>
                </div>
            </div>
        );
    }

    return null;
}

export function TenantUsageChart({ data = defaultData }: { data?: any[] }) {

    return (
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl mt-6">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" /> API Metrics & Abuse Monitoring
                </CardTitle>
                <CardDescription className="text-slate-400">
                    6-month telemetry of AI Token usage and incoming client requests. Look for anomalous spikes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /> {/* Indigo 500 */}
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /> {/* Emerald 500 */}
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                stroke="#475569"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#475569"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '5 5' }} />

                            <Area
                                type="monotone"
                                dataKey="tokens"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTokens)"
                            />
                            <Area
                                type="monotone"
                                dataKey="interactions"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRequests)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
