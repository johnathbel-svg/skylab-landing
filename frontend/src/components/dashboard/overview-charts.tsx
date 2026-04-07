/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell
} from "recharts"
import { motion } from "framer-motion"
import { Zap, Activity, Info, Calendar, TrendingUp } from 'lucide-react'

interface DataPoint {
    date: string;
    count: number;
}

interface ChannelPoint {
    name: string;
    value: number;
}

interface OverviewChartsProps {
    volumeData: DataPoint[]
    channelData: ChannelPoint[]
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function OverviewCharts({ volumeData, channelData }: OverviewChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
            {/* Main Area Chart - Conversation Flow */}
            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-8 flex flex-col p-6 lg:p-7 border-r border-slate-100 dark:border-white/5"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-sm">
                                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">Flujo Operativo</h2>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1">Análisis de Pulsaciones Gen-3</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-white/5 p-1 rounded-xl border border-slate-200/50 dark:border-white/5">
                        <button className="px-4 py-1.5 bg-white dark:bg-white/10 text-slate-900 dark:text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm border border-slate-200 dark:border-indigo-500/30 transition-all">Volumen</button>
                        <button className="px-4 py-1.5 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:text-slate-600 dark:hover:text-white transition-all">Sentimiento</button>
                    </div>
                </div>

                <div className="flex-1 w-full min-h-[320px] relative">
                    {volumeData.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-white/10 gap-4">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-dashed border-slate-200 dark:border-white/10">
                                <Zap className="w-8 h-8 animate-pulse" />
                            </div>
                            <p className="font-black uppercase tracking-[0.3em] text-[9px]">Esperando Telemetría...</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="60%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="5" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4', opacity: 0.2 }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900/98 dark:bg-[#020617]/98 text-white p-5 rounded-2xl shadow-3xl border border-white/10 backdrop-blur-xl animate-in zoom-in-95 duration-200">
                                                    <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-white/5">
                                                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-black tracking-tighter">{payload[0].value}</span>
                                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Leads</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    animationDuration={1500}
                                    style={{ filter: 'url(#glowEffect)' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </motion.div>

            {/* Side Distribution - Donut Chart */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-4 flex flex-col p-6 lg:p-7 justify-between bg-slate-50/20 dark:bg-transparent"
            >
                <div className="mb-6 relative z-10">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-sm">
                            <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">Origen de Red</h2>
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1">Nodos de Intercepción</p>
                </div>

                <div className="flex-1 w-full min-h-[260px] relative flex flex-col justify-center items-center">
                    {channelData.length === 0 ? (
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-30">Sin Telemetría</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={channelData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={10}
                                        dataKey="value"
                                        stroke="none"
                                        animationDuration={1200}
                                    >
                                        {channelData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const total = channelData.reduce((acc, curr) => acc + curr.value, 0);
                                                const percent = Math.round((Number(payload[0].value) / total) * 100);
                                                return (
                                                    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-1.5">{payload[0].name}</p>
                                                        <p className="text-xl font-black leading-none">{payload[0].value}</p>
                                                        <div className="mt-2 text-[8px] font-black bg-white/5 py-1 px-3 rounded-full border border-white/5">
                                                            {percent}% Mix
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Total</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                                    {channelData.reduce((acc, curr) => acc + curr.value, 0)}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Legend List - Highly Compact */}
                <div className="mt-8 grid grid-cols-2 gap-2 relative z-10">
                    {channelData.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 group/legend transition-all hover:bg-slate-100 dark:hover:bg-white/10">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest truncate">{item.name}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
