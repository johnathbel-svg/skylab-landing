/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity } from 'lucide-react'

interface TenantUsageChartProps {
    data?: { day: string; count: number }[]
}

const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
    } catch {
        return dateString
    }
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl shrink-0 text-sm">
                <p className="text-white font-bold mb-2">{formatDate(label)}</p>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <p className="text-slate-300">Mensajes: <span className="font-mono text-white">{payload[0].value}</span></p>
                </div>
            </div>
        );
    }
    return null;
}

export function TenantUsageChart({ data = [] }: TenantUsageChartProps) {
    const hasData = data && data.length > 0

    return (
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl mt-6">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" /> API Metrics & Abuse Monitoring
                </CardTitle>
                <CardDescription className="text-slate-400">
                    30-day telemetry of incoming client requests and messages. Look for anomalous spikes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /> {/* Indigo 500 */}
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="day"
                                    stroke="#475569"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={formatDate}
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
                                    dataKey="count"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorTokens)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[300px] w-full mt-4 flex flex-col items-center justify-center border border-dashed border-slate-800/60 rounded-xl bg-slate-950/20">
                        <Activity className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="text-slate-400 font-medium">No activity yet</p>
                        <p className="text-xs text-slate-500 mt-1">Telemetry will begin showing once messages are sent.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}