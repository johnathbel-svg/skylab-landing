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
import { Zap, Activity, Info, Calendar, Globe, MessageCircle, Send, Network } from "lucide-react"

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

const getChannelColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("web")) return "#00B4DB";
    if (n.includes("whatsapp")) return "#10B981";
    if (n.includes("telegram")) return "#0EA5E9";
    return "#8B5CF6";
}

const getChannelIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("web")) return Globe;
    if (n.includes("whatsapp")) return MessageCircle;
    if (n.includes("telegram")) return Send;
    return Network;
};

export function OverviewCharts({ volumeData, channelData }: OverviewChartsProps) {
    const totalConvs = channelData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-[24px]">
            {/* Main Area Chart - Conversation Flow */}
            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-8 flex flex-col p-6 lg:p-7 lg:border-r border-b lg:border-b-0 border-white/10"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-sm">
                                <Activity className="w-4 h-4 text-indigo-400" />
                            </div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Flujo Operativo</h2>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] ml-1">Análisis de Pulsaciones Gen-3</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/[0.05] p-1 rounded-xl border border-white/5">
                        <button className="px-4 py-1.5 bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm border border-indigo-500/30 transition-all">Volumen</button>
                        <button className="px-4 py-1.5 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">Sentimiento</button>
                    </div>
                </div>

                <div className="flex-1 w-full min-h-[320px] relative">
                    {volumeData.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
                            <div className="w-16 h-16 bg-white/[0.05] rounded-2xl flex items-center justify-center border border-dashed border-white/10">
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
                                    tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 900 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 900 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ stroke: "#6366f1", strokeWidth: 2, strokeDasharray: "4 4", opacity: 0.2 }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#020617]/98 text-white p-5 rounded-2xl shadow-3xl border border-white/10 backdrop-blur-xl animate-in zoom-in-95 duration-200">
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
                                    style={{ filter: "url(#glowEffect)" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </motion.div>

            {/* Side Distribution - Donut Chart (Integration Hub Style) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-4 flex flex-col p-6 lg:p-7 justify-between bg-slate-950/40 backdrop-blur-sm"
            >
                <div className="mb-6 relative z-10">
                    <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-sm">
                            <Info className="w-4 h-4 text-purple-400" />
                        </div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Origen de Red</h2>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] ml-1">Nodos de Intercepción</p>
                </div>

                <div className="flex-1 w-full min-h-[260px] relative flex flex-col justify-center items-center">
                    {channelData.length === 0 ? (
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-35">Sin Telemetría</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={channelData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={6}
                                        dataKey="value"
                                        stroke="none"
                                        animationDuration={1200}
                                    >
                                        {channelData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={getChannelColor(entry.name)}
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
                                                    <div className="bg-[#020617]/98 text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-1.5">{payload[0].name}</p>
                                                        <p className="text-xl font-black leading-none">{payload[0].value}</p>
                                                        <div className="mt-2 text-[8px] font-black bg-white/[0.05] py-1 px-3 rounded-full border border-white/5 text-slate-300">
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

                            {/* Glowing Total Indicator */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.25em] mb-1">Total</p>
                                <p className="text-3xl font-extrabold text-white leading-none tracking-tight drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                                    {totalConvs}
                                </p>
                                <span className="text-[8px] text-emerald-400 font-bold tracking-widest mt-1 block uppercase">Online</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Legend List - Integration Node Style */}
                <div className="mt-6 flex flex-col gap-2 relative z-10">
                    {channelData.slice(0, 4).map((item, idx) => {
                        const IconComponent = getChannelIcon(item.name);
                        const color = getChannelColor(item.name);
                        const percent = totalConvs > 0 ? Math.round((item.value / totalConvs) * 100) : 0;

                        return (
                            <div 
                                key={idx} 
                                className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group/legend"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Circular Icon Wrapper */}
                                    <div 
                                        className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                                        style={{ 
                                            backgroundColor: `${color}10`,
                                            borderColor: `${color}25`
                                        }}
                                    >
                                        <IconComponent 
                                            className="w-4 h-4" 
                                            style={{ color: color }}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-white tracking-tight">{item.name}</span>
                                        <span className="text-[9px] text-slate-500 font-medium">Nodo Activo</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black text-slate-300 block">{item.value}</span>
                                    <span className="text-[9px] text-emerald-400 font-bold tracking-tighter">{percent}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    )
}