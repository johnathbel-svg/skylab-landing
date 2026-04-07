/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Webhook,
    MessageCircle,
    Send,
    Instagram as InstagramIcon,
    Facebook,
    Link2,
    Sparkles,
    CheckCircle2,
    ChevronRight,
    X,
    QrCode,
    Bot,
    Loader2,
    Globe,
    Zap,
    Lock,
    Shield,
    Activity,
    Code,
    Copy,
    ExternalLink,
    Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { connectTelegramAction, getTenantBotsAction } from '@/app/actions/integrations'
import { toast } from 'sonner'

type ChannelId = 'whatsapp' | 'telegram' | 'messenger' | 'instagram' | 'web_widget' | null

interface ChannelConfig {
    id: NonNullable<ChannelId>
    name: string
    description: string
    icon: any
    color: string
    bgColor: string
    status: 'connected' | 'disconnected' | 'coming_soon'
}

const CHANNELS: ChannelConfig[] = [
    {
        id: 'whatsapp',
        name: 'WhatsApp Business',
        description: 'Conecta tu API oficial de Meta para flujo masivo.',
        icon: MessageCircle,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        status: 'disconnected'
    },
    {
        id: 'telegram',
        name: 'Telegram Bot',
        description: 'Sincronización instantánea vía API de BotFather.',
        icon: Send,
        color: 'text-sky-500',
        bgColor: 'bg-sky-500/10',
        status: 'disconnected'
    },
    {
        id: 'web_widget',
        name: 'Web Chat SDK',
        description: 'Incrusta tu bot en cualquier sitio web con una línea.',
        icon: Code,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
        status: 'connected'
    },
    {
        id: 'instagram',
        name: 'Instagram DM',
        description: 'Gestión inteligente de menciones y mensajes directos.',
        icon: InstagramIcon,
        color: 'text-fuchsia-500',
        bgColor: 'bg-fuchsia-500/10',
        status: 'coming_soon'
    }
]

export default function IntegrationsPage() {
    const [selectedChannel, setSelectedChannel] = useState<ChannelId>(null)
    const [wizardStep, setWizardStep] = useState(1)
    const [token, setToken] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [bots, setBots] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        const fetchBots = async () => {
            const res = await getTenantBotsAction();
            if (res.success && res.bots) {
                setBots(res.bots);
            }
        };
        fetchBots();
    }, []);

    const handleConnectTelegram = async () => {
        if (!token) {
            toast.error("Por favor ingresa un token válido");
            return;
        }
        setIsLoading(true);
        try {
            const result = await connectTelegramAction(token);
            if (result.success) {
                toast.success(result.message);
                resetWizard();
            } else {
                toast.error(result.error || "Error al conectar");
            }
        } catch (error) {
            toast.error("Error de red");
        } finally {
            setIsLoading(false);
        }
    }

    const resetWizard = () => {
        setSelectedChannel(null)
        setWizardStep(1)
        setToken('')
    }

    return (
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-[#020617] p-8 md:p-12 relative">

            {/* Background elements - Orbital atmosphere */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                {/* Header Section - Modern Skylab Style */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-200 dark:border-white/5 pb-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                            <Sparkles className="w-3 h-3 animate-pulse" /> Ecosistema de Conexión
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter font-display">
                            Hub Integrado
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                            Sincroniza tus canales de comunicación y potencia tu alcance con nuestra infraestructura omnicanal blindada.
                        </p>
                    </div>

                    <div className="flex items-center gap-(4) bg-white dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="flex flex-col items-center px-4 border-r border-slate-100 dark:border-white/5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado API</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-black text-slate-800 dark:text-white">Operativo</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="h-12 px-5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 gap-2"
                        >
                            <Activity className="w-4 h-4" /> Log de Sistema
                        </Button>
                    </div>
                </div>

                {/* Main Feature Banner - Cinematic */}
                <div className="group relative rounded-[40px] overflow-hidden bg-slate-900 dark:bg-indigo-950 p-1 md:p-1 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-800 opacity-90" />
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                                <Zap className="w-8 h-8 text-amber-300 fill-amber-300" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">Despliegue Instantáneo</h2>
                                <p className="text-indigo-100 text-lg font-medium opacity-80 leading-relaxed max-w-lg">
                                    Configura tus canales en segundos con nuestro asistente de enlace automático. <br className="hidden md:block" /> Sin fricciones, sin código complejo.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button className="bg-white text-indigo-900 hover:bg-indigo-50 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs transition-transform hover:scale-[1.02]">
                                    Explorar Documentación
                                </Button>
                                <Button variant="ghost" className="text-white hover:bg-white/10 h-14 px-6 rounded-2xl font-bold gap-2">
                                    <Play className="w-4 h-4 fill-white" /> Demo Rápida
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-400/20 blur-[60px] rounded-full animate-pulse" />
                            <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
                                <div className="space-y-4 w-64">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-white/5 rounded-full" />
                                        <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                                        <div className="h-10 w-full bg-indigo-500/20 rounded-xl mt-4 border border-indigo-500/30 flex items-center justify-center">
                                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Status: Conectado</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Channels Grid - Elevated aesthetics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                    {CHANNELS.map((channel) => (
                        <motion.div
                            key={channel.id}
                            whileHover={{ y: -8, scale: 1.02 }}
                            onClick={() => channel.status !== 'coming_soon' ? setSelectedChannel(channel.id) : null}
                            className={`group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[40px] p-8 shadow-sm flex flex-col relative overflow-hidden transition-all duration-500 ${channel.status === 'coming_soon' ? 'opacity-60 cursor-not-allowed grayscale' : 'cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30'}`}
                        >
                            {/* Card Glow Effect */}
                            <div className={`absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px] pointer-events-none rounded-full ${channel.bgColor}`} />

                            <div className="flex items-start justify-between mb-10">
                                <div className={`w-16 h-16 rounded-[24px] ${channel.bgColor} ${channel.color} flex items-center justify-center transition-all group-hover:rotate-12 group-hover:scale-110 duration-700 shadow-lg shadow-${channel.id}-500/5`}>
                                    <channel.icon className="w-8 h-8" />
                                </div>
                                {channel.status === 'connected' ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        Activo
                                    </div>
                                ) : channel.status === 'coming_soon' ? (
                                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full">Pronto</div>
                                ) : (
                                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full italic opacity-60">Inactivo</div>
                                )}
                            </div>

                            <div className="space-y-3 flex-1">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{channel.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300">
                                    {channel.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100 dark:border-white/5 group-hover:border-indigo-500/20 transition-colors">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <div className={`w-8 h-8 rounded-full ${channel.bgColor} border-2 border-white dark:border-slate-800 flex items-center justify-center`}>
                                        <channel.icon className={`w-4 h-4 ${channel.color}`} />
                                    </div>
                                </div>
                                <div className={`w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center transition-all group-hover:${channel.bgColor}`}>
                                    <ChevronRight className={`w-5 h-5 text-slate-400 group-hover:${channel.color}`} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Insight Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Security Card */}
                    <div className="bg-white dark:bg-[#0f172a] rounded-[48px] p-10 md:p-12 border border-slate-200 dark:border-white/5 shadow-sm group overflow-hidden relative">
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
                        <div className="flex flex-col md:flex-row gap-10 items-center">
                            <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center relative shadow-inner">
                                <Shield className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white dark:border-[#0f172a]">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Bóveda de Seguridad Molecular</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                    Tus credenciales y tokens de acceso son transformados en hashes irreversibles bajo el estándar <strong className="text-slate-900 dark:text-white">AES-256 GCM</strong>.
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                                        <Lock className="w-3 h-3 text-emerald-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TLS 1.3 Active</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                                        <Globe className="w-3 h-3 text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global IP Isolation</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Developer Card */}
                    <div className="bg-indigo-600 dark:bg-indigo-900 rounded-[48px] p-10 md:p-12 shadow-xl shadow-indigo-600/20 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
                            <div className="flex-1 space-y-6 text-center md:text-left">
                                <div className="inline-flex h-8 items-center px-4 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20">Zona Dev</div>
                                <h3 className="text-2xl font-black text-white tracking-tighter">SDK & Webhooks</h3>
                                <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-80">
                                    Potencia tu bot integrándolo con tu propio CRM, sistema de inventarios o bases de datos externas vía nuestra API REST.
                                </p>
                                <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs">
                                    Generar API KEY
                                </Button>
                            </div>
                            <div className="w-40 h-40 bg-white/5 rounded-full border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                <Code className="w-20 h-20 text-white/20 group-hover:text-white/40 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Wizard Modal - Cinematic Refinement */}
            <AnimatePresence>
                {selectedChannel && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={resetWizard}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 40 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[56px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/10"
                        >
                            {/* Modal Header */}
                            <div className="px-12 py-10 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-5">
                                    <div className={`w-16 h-16 ${selectedChannel === 'telegram' ? 'bg-sky-500' : 'bg-indigo-600'} rounded-[24px] shadow-2xl flex items-center justify-center`}>
                                        <Bot className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">
                                            {selectedChannel === 'telegram' ? 'Enlace Telegram' :
                                                selectedChannel === 'web_widget' ? 'Despliegue Web' : 'Sincronizador'}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex gap-1">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= wizardStep ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-white/10'}`} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fase {wizardStep} de 3</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={resetWizard}
                                    title="Cerrar"
                                    className="w-14 h-14 flex items-center justify-center bg-slate-200/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 rounded-[24px] transition-all"
                                >
                                    <X className="w-7 h-7" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-12 min-h-[420px] flex flex-col">
                                {selectedChannel === 'telegram' && (
                                    <div className="flex-1 flex flex-col">
                                        <AnimatePresence mode="wait">
                                            {wizardStep === 1 && (
                                                <motion.div
                                                    key="t1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-8"
                                                >
                                                    <div className="inline-flex h-8 items-center px-4 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-sky-100 dark:border-sky-500/20">Localización</div>
                                                    <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Busca al Guardián</h4>
                                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                                                        Abre Telegram y localiza a <strong className="text-slate-900 dark:text-white">@BotFather</strong>. Él es el responsable de emitir las llaves de acceso para la red.
                                                    </p>
                                                    <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5 flex items-center gap-8 group">
                                                        <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-[20px] shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Send className="w-8 h-8 text-sky-500" />
                                                        </div>
                                                        <p className="text-slate-700 dark:text-slate-300 font-bold">Haz clic en el botón <span className="text-sky-600 dark:text-sky-400">INICIAR</span> para abrir el canal de comunicación.</p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {wizardStep === 2 && (
                                                <motion.div
                                                    key="t2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-8"
                                                >
                                                    <div className="inline-flex h-8 items-center px-4 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-sky-100 dark:border-sky-500/20">Gestación</div>
                                                    <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Define el Avatar</h4>
                                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                                                        Envía <code className="bg-slate-100 dark:bg-white/10 px-2 py-1 rounded text-sky-600 font-bold">/newbot</code> y completa el ritual:
                                                    </p>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-5 p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl shadow-sm">
                                                            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 font-black">1</div>
                                                            <p className="font-bold text-slate-800 dark:text-slate-200 italic font-display">Nombra a tu representante.</p>
                                                        </div>
                                                        <div className="flex items-center gap-5 p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl shadow-sm">
                                                            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 font-black">2</div>
                                                            <p className="font-bold text-slate-800 dark:text-slate-200">Elige un username único (Ej: MiTiendaBot).</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {wizardStep === 3 && (
                                                <motion.div
                                                    key="t3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-8"
                                                >
                                                    <div className="inline-flex h-8 items-center px-4 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-sky-100 dark:border-sky-500/20">Fusión</div>
                                                    <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Sincronizar Token</h4>
                                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Introduce la llave generada para completar la integración atómica.</p>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] px-2">HTTP API TOKEN</label>
                                                        <input
                                                            autoFocus type="text" value={token} onChange={(e) => setToken(e.target.value)}
                                                            placeholder="0000000000:AAHH..."
                                                            className="w-full h-24 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[32px] px-8 text-2xl font-mono focus:outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/10 transition-all text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {selectedChannel === 'web_widget' && (
                                    <div className="flex-1 flex flex-col space-y-10">
                                        <div className="inline-flex h-8 items-center px-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100 dark:border-indigo-500/20 w-fit">Despliegue Web</div>
                                        <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Incrustar Asistente</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                                            Copia este fragmento de código antes del cierre de la etiqueta <code className="text-indigo-500">&lt;/body&gt;</code> de tu sitio web.
                                        </p>

                                        <div className="relative group">
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <Button size="icon" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white rounded-xl" onClick={() => {
                                                    navigator.clipboard.writeText(`<script src="${window.location.host}/widget.js" async></script>`);
                                                    toast.success("Código copiado al portapapeles");
                                                }}>
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="bg-slate-900 rounded-[32px] p-10 font-mono text-sm text-indigo-300 border border-white/10 shadow-2xl overflow-x-auto whitespace-pre">
                                                {`<!-- Script de BotFlow -->
<script 
  src="https://skylab.botflow.com/sdk.js" 
  data-bot-id="${bots[0]?.id || 'TEMP_ID'}" 
  async 
></script>`}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-6 bg-indigo-50 dark:bg-white/5 rounded-3xl border border-indigo-100 dark:border-white/10 italic text-sm text-slate-600 dark:text-slate-400">
                                            <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center shadow-sm">
                                                <ExternalLink className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            Puedes personalizar los colores del widget en el constructor de bots.
                                        </div>
                                    </div>
                                )}

                                {(selectedChannel !== 'telegram' && selectedChannel !== 'web_widget') && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                        <div className="w-32 h-32 bg-slate-50 dark:bg-white/5 rounded-[40px] flex items-center justify-center relative shadow-inner">
                                            <QrCode className="w-20 h-20 text-slate-200 dark:text-white/10" strokeWidth={1} />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 bg-white dark:bg-white/10 rounded-2xl shadow-2xl flex items-center justify-center">
                                                    <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Preparando Instancia</h4>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">Estamos levantando un clúster dedicado para tu integración con {CHANNELS.find(c => c.id === selectedChannel)?.name}.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-12 py-10 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 backdrop-blur-md flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auditoría de Enlace Activa</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {wizardStep > 1 && selectedChannel === 'telegram' && (
                                        <Button
                                            variant="ghost" onClick={() => setWizardStep(s => s - 1)}
                                            className="font-black uppercase tracking-widest text-[10px] text-slate-500 h-12 px-8 rounded-2xl hover:bg-slate-200"
                                        >
                                            Regresar
                                        </Button>
                                    )}
                                    <Button
                                        disabled={isLoading}
                                        onClick={() => {
                                            if (selectedChannel === 'telegram') {
                                                if (wizardStep < 3) setWizardStep(s => s + 1)
                                                else handleConnectTelegram()
                                            } else {
                                                resetWizard();
                                            }
                                        }}
                                        className="h-16 px-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-600/30 gap-4 group transition-all"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                {wizardStep < 3 && selectedChannel === 'telegram' ? 'Siguiente Fase' : 'Finalizar Proceso'}
                                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
