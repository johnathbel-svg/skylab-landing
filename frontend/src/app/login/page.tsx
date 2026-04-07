"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkylabBrandText } from "@/components/layout/SkylabLogo"
import { SkylabOriginalLogo } from "@/components/layout/SkylabOriginalLogo"
import { login, signup } from "../auth/actions"
import { Loader2, Mail, Lock, ArrowRight, Sparkles, ShieldCheck, Cpu, Zap } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
    const searchParams = useSearchParams()
    const message = searchParams.get("message")
    const [isLoading, setIsLoading] = useState(false)
    const [actionType, setActionType] = useState<'login'|'signup'|null>(null)

    // Ensure we mount cleanly for framer-motion client-side only
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    async function handleAction(formData: FormData, type: 'login' | 'signup') {
        setIsLoading(true)
        setActionType(type)
        if (type === 'login') {
            await login(formData)
        } else {
            await signup(formData)
        }
        setIsLoading(false)
        setActionType(null)
    }

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#020617] flex font-sans overflow-hidden selection:bg-indigo-500/30">
            {/* Left Side - Visual Branding */}
            <div className="hidden lg:flex w-[55%] relative flex-col justify-center px-20 border-r border-white/5 bg-[#030712] overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse opacity-50" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse opacity-40" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>

                <div className="relative z-10 space-y-12 max-w-xl">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="mb-12"
                    >
                        {/* Massive inverted logo */}
                        <SkylabOriginalLogo className="w-48 h-48 drop-shadow-[0_0_30px_rgba(14,165,233,0.3)] mb-8" />
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="text-5xl xl:text-7xl font-black tracking-tighter text-white leading-[1.1] mb-6">
                            Inteligencia que
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                Transforma
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed font-medium">
                            Conecta tu negocio al nexo operativo de Skylab. Automatización impulsada por modelos fundacionales para equipos de alto rendimiento.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-8 sm:p-12 relative z-10 bg-[#020617]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[420px] space-y-10"
                >
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="flex items-center gap-3 mb-8">
                            <SkylabOriginalLogo className="w-12 h-12" />
                            <SkylabBrandText className="text-4xl font-black mt-2" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Bienvenido de Vuelta</h2>
                        <p className="text-slate-400 font-medium mt-2 text-sm">Ingresa tus credenciales para acceder al nexo.</p>
                    </div>

                    <form className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2 relative group">
                                <label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1 block">Email Corporativo</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="ejemplo@tuempresa.com"
                                        required
                                        className="h-14 pl-12 bg-white/5 border-white/10 text-white rounded-2xl focus-visible:ring-indigo-500/50 focus-visible:bg-white/10 transition-all font-medium placeholder:text-slate-600 text-[15px]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 relative group">
                                <div className="flex justify-between items-center ml-1">
                                    <label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-slate-500">Contraseña</label>
                                    <Link href="#" className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">¿Olvidaste tu clave?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••••••"
                                        required
                                        className="h-14 pl-12 bg-white/5 border-white/10 text-white rounded-2xl focus-visible:ring-indigo-500/50 focus-visible:bg-white/10 transition-all font-medium text-[15px] tracking-widest placeholder:tracking-normal placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {message && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-3"
                                >
                                    <ShieldCheck className="w-5 h-5 shrink-0" />
                                    <span>{message}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4 pt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                formAction={(formData) => handleAction(formData, 'login')}
                                className="w-full h-14 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-[15px] transition-all shadow-xl hover:shadow-white/20 hover:scale-[1.02] active:scale-95 group"
                            >
                                {isLoading && actionType === 'login' ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <>Ingresar al Nexo <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </Button>
                            
                            <Button
                                type="submit"
                                disabled={isLoading}
                                formAction={(formData) => handleAction(formData, 'signup')}
                                variant="outline"
                                className="w-full h-14 bg-transparent border-white/10 text-white hover:bg-white/5 rounded-2xl font-bold text-[14px] transition-all"
                            >
                                {isLoading && actionType === 'signup' ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <>Solicitar Acceso <Zap className="w-4 h-4 ml-2 opacity-50" /></>
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="text-center mt-auto pt-8">
                        <p className="text-[11px] text-slate-500 font-medium">
                            Protegido por Skylab Protocol v3.0 • <br className="sm:hidden" />
                            <Link href="#" className="hover:text-white transition-colors underline underline-offset-4 opacity-70">Términos</Link> y <Link href="#" className="hover:text-white transition-colors underline underline-offset-4 opacity-70">Privacidad</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
