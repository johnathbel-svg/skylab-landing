"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
    Sparkles, Info, ShieldCheck, Globe, Cpu, Database, KeyRound, 
    Smartphone, MessageSquareText, HelpCircle, Heart, CheckCircle2 
} from 'lucide-react'
import Image from 'next/image'

import instagramIcon from '../../../../Iconos/instagram.png'
import metaIcon from '../../../../Iconos/logo meta.png'
import telegramIcon from '../../../../Iconos/telegrama.png'
import webIcon from '../../../../Iconos/web.png'
import whatsappIcon from '../../../../Iconos/whatsapp.png'

export default function AboutPage() {
    const [activeTechTab, setActiveTechTab] = React.useState<'humanization' | 'security' | 'rag'>('humanization')

    return (
        <div className="flex-1 overflow-y-auto bg-[#070B12] p-6 md:p-12 relative font-sans">
            {/* Background Atmosphere Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00B4DB]/5 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto space-y-12 relative z-10">
                {/* Header */}
                <div className="border-b border-white/10 pb-8 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00B4DB]/10 border border-[#00B4DB]/20 rounded-full text-[#00B4DB] text-[10px] font-black uppercase tracking-widest">
                        <Info className="w-3.5 h-3.5" /> Ficha Técnica de Producto
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                        Acerca de Skylab
                    </h1>
                    <p className="text-[#A6B3C4] font-medium max-w-xl leading-relaxed">
                        Conoce los componentes, arquitectura y especificaciones del motor molecular de inteligencia artificial y automatización de canales.
                    </p>
                </div>

                {/* Brand Showcase Section (Fidelidad de Marcas) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skylab Brand Box */}
                    <div className="bg-[#0B0F17] border border-white/10 rounded-[32px] p-8 relative overflow-hidden flex flex-col justify-between group hover:border-[#00B4DB]/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4DB]/5 blur-[60px] rounded-full" />
                        <div className="space-y-6">
                            <span className="text-[10px] font-black text-[#7E8A9C] uppercase tracking-widest">Plataforma Omnicanal</span>
                            <div className="relative h-14 w-full max-w-[220px]">
                                <Image 
                                    src="/brand/skylab-horizontal-transparent.png" 
                                    alt="Skylab Logo" 
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                            <p className="text-xs text-[#A6B3C4] leading-relaxed">
                                Ecosistema SaaS molecular que unifica el modelado de personalidad de bots (Bot DNA Builder), entrenamiento semántico de bases de conocimiento y CRM de contactos.
                            </p>
                        </div>
                        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Licencia de Uso Activa</span>
                            <span className="text-[#00B4DB] font-bold">Consola de Cliente</span>
                        </div>
                    </div>

                    {/* Synerg-IA Brand Box */}
                    <div className="bg-[#0B0F17] border border-white/10 rounded-[32px] p-8 relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/20 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full" />
                        <div className="space-y-6">
                            <span className="text-[10px] font-black text-[#7E8A9C] uppercase tracking-widest">Infraestructura & Desarrollo</span>
                            <div className="relative h-14 w-full max-w-[190px]">
                                <Image 
                                    src="/brand/synergia-wordmark-transparent.png" 
                                    alt="Synerg-IA Wordmark" 
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                            <p className="text-xs text-[#A6B3C4] leading-relaxed">
                                Desarrollado y soportado por **Synerg-IA Automation**, startup colombiana especializada en automatización inteligente de flujos operativos para medianas y pequeñas empresas.
                            </p>
                        </div>
                        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Soporte Oficial en Medellín</span>
                            <span className="text-emerald-400 font-bold">Synerg-IA Core</span>
                        </div>
                    </div>
                </div>

                {/* Technical Specifications Grid */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-white tracking-tight">Especificaciones de Arquitectura</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Box 1: Core Runtime */}
                        <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-5 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">Runtime de Ejecución</h4>
                                <p className="text-[11px] text-[#A6B3C4] mt-1 leading-relaxed">
                                    Next.js 14+ con App Router en Node.js 20+, hosteado en VPS independiente y balanceo Nginx.
                                </p>
                            </div>
                        </div>

                        {/* Box 2: Database Layer */}
                        <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-5 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-[#00B4DB]/10 flex items-center justify-center text-[#00B4DB]">
                                <Database className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">Base de Datos PostgreSQL</h4>
                                <p className="text-[11px] text-[#A6B3C4] mt-1 leading-relaxed">
                                    Supabase Cloud DB con políticas RLS robustas y almacenamiento de embeddings vectoriales `pgvector`.
                                </p>
                            </div>
                        </div>

                        {/* Box 3: Encryption & Vault */}
                        <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-5 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">Cifrado de Credenciales</h4>
                                <p className="text-[11px] text-[#A6B3C4] mt-1 leading-relaxed">
                                    Llaves de API e integraciones de clientes cifradas bajo el estándar AES-256-GCM en bóveda blindada.
                                </p>
                            </div>
                        </div>

                        {/* Box 4: LLM Processing Engine */}
                        <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-5 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">Inferencia RAG Inteligente</h4>
                                <p className="text-[11px] text-[#A6B3C4] mt-1 leading-relaxed">
                                    Gemini 3.1 Pro (Inferencia) + Gemini 3.1 Flash (Fallback) integrados con control de latencia activa.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Technology Hub (Tabs) */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-lg font-black text-white tracking-tight">Núcleo Tecnológico & Blindaje</h3>
                        <div className="bg-[#0B0F17] p-1 rounded-xl border border-white/10 flex gap-1 self-stretch md:self-auto">
                            <button 
                                onClick={() => setActiveTechTab('humanization')} 
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTechTab === 'humanization' ? 'bg-[#00B4DB] text-white' : 'text-[#A6B3C4] hover:text-white'}`}
                            >
                                Humanización
                            </button>
                            <button 
                                onClick={() => setActiveTechTab('security')} 
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTechTab === 'security' ? 'bg-[#00B4DB] text-white' : 'text-[#A6B3C4] hover:text-white'}`}
                            >
                                Seguridad & SSRF
                            </button>
                            <button 
                                onClick={() => setActiveTechTab('rag')} 
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTechTab === 'rag' ? 'bg-[#00B4DB] text-white' : 'text-[#A6B3C4] hover:text-white'}`}
                            >
                                Inferencia RAG
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#0B0F17] border border-white/10 rounded-[32px] p-8 min-h-[320px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4DB]/5 blur-[80px] rounded-full pointer-events-none" />
                        
                        {activeTechTab === 'humanization' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <Smartphone className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-white">Simulador de Escritura y Delays Adaptativos</h4>
                                        <p className="text-xs text-[#7E8A9C] mt-0.5">Emulación humana de chat (Turing Tech)</p>
                                    </div>
                                </div>
                                <p className="text-sm text-[#A6B3C4] leading-relaxed">
                                    Skylab incorpora un motor de tiempo que calcula de manera dinámica los tiempos de respuesta basándose en la longitud del mensaje. Esto emula un ritmo de escritura promedio de 40 palabras por minuto con una variación aleatoria realista de ±20%.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                    <div className="bg-[#070B12] p-4 rounded-xl border border-white/5 space-y-2">
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Fraccionador Lógico</span>
                                        <p className="text-xs text-[#A6B3C4]">Divide párrafos largos en 2 a 4 mensajes lógicos independientes para simular pausas de lectura reales.</p>
                                    </div>
                                    <div className="bg-[#070B12] p-4 rounded-xl border border-white/5 space-y-2">
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Estado Escribiendo</span>
                                        <p className="text-xs text-[#A6B3C4]">Activa el indicador dinámico de escritura en WhatsApp y widgets web antes de emitir cada bloque de texto.</p>
                                    </div>
                                    <div className="bg-[#070B12] p-4 rounded-xl border border-white/5 space-y-2">
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Sliders de ADN</span>
                                        <p className="text-xs text-[#A6B3C4]">Sliders en el panel para modificar el entusiasmo, formalidad y uso de jergas regionales (ej: tono Paisa).</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTechTab === 'security' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <ShieldCheck className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-white">Bóveda Criptográfica y Blindaje de Ingesta</h4>
                                        <p className="text-xs text-[#7E8A9C] mt-0.5">Sanitización PII, RLS Aislado y defensa SSRF</p>
                                    </div>
                                </div>
                                <p className="text-sm text-[#A6B3C4] leading-relaxed">
                                    La plataforma implementa un esquema de seguridad multicapa que previene fugas de datos y protege los servidores corporativos contra abusos de red.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                    <div className="bg-[#070B12] p-4 rounded-xl border border-white/5 space-y-2">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Aislamiento RLS</span>
                                        <p className="text-xs text-[#A6B3C4]">Políticas Row Level Security estrictas en todas las tablas de conocimiento para separar los datos de clientes.</p>
                                    </div>
                                    <div className="bg-[#070B12] p-4 rounded-xl border border-white/5 space-y-2">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Filtros Anti-Fugas</span>
                                        <p className="text-xs text-[#A6B3C4]">Sanitización por regex en el servidor que detecta y remueve credenciales de APIs, JWTs y tarjetas de crédito.</p>
                                    </div>
                                    <div className="bg-[#070B12] p-4 rounded-xl border border-white/5 space-y-2">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Bloqueo SSRF</span>
                                        <p className="text-xs text-[#A6B3C4]">Resolución DNS en el scraper que restringe accesos a hosts locales e IPs privadas (como localhost o cloud metadata).</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTechTab === 'rag' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                        <Database className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-white">Inferencia RAG Inteligente con pgvector</h4>
                                        <p className="text-xs text-[#7E8A9C] mt-0.5">Embeddings de alta fidelidad y fallback dinámico</p>
                                    </div>
                                </div>
                                <p className="text-sm text-[#A6B3C4] leading-relaxed">
                                    El cerebro del bot realiza búsquedas de similitud vectorial de baja latencia utilizando modelos de embedding avanzados de Gemini, resolviendo consultas del usuario final en tiempo récord.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                    <div className="bg-[#070B12] p-4 rounded-xl border border-white/5 space-y-2">
                                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Gemini 3.1 Pro Engine</span>
                                        <p className="text-xs text-[#A6B3C4]">Inferencia premium para razonamiento profundo y fallback automático a Gemini Flash ante picos de demanda.</p>
                                    </div>
                                    <div className="bg-[#070B12] p-4 rounded-xl border border-white/5 space-y-2">
                                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Anclaje de Metadatos</span>
                                        <p className="text-xs text-[#A6B3C4]">Cada fragmento se vectoriza junto a su origen (título, URI) evitando alucinaciones y falsas referencias.</p>
                                    </div>
                                    <div className="bg-[#070B12] p-4 rounded-xl border border-white/5 space-y-2">
                                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Límites por Plan</span>
                                        <p className="text-xs text-[#A6B3C4]">Validación estricta de cuotas por tier (Starter/Pro/Business) previniendo abusos y controlando el consumo de API.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Connectors Status */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-white tracking-tight">Estatus de Integraciones Oficiales</h3>
                    <div className="bg-[#0B0F17] border border-white/10 rounded-[32px] p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* WhatsApp */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center p-1.5 border border-emerald-500/10">
                                        <Image src={whatsappIcon} alt="WhatsApp" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-sm font-bold text-white">Meta WhatsApp Cloud</span>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded uppercase">Activo</span>
                            </div>
                            <p className="text-xs text-[#A6B3C4] leading-relaxed">
                                Conexión directa a través de Meta API Setup. Webhooks firmados criptográficamente y control de ventana de 24 horas.
                            </p>
                        </div>

                        {/* Telegram */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center p-1.5 border border-sky-500/10">
                                        <Image src={telegramIcon} alt="Telegram" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-sm font-bold text-white">Telegram Bot API</span>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded uppercase">Activo</span>
                            </div>
                            <p className="text-xs text-[#A6B3C4] leading-relaxed">
                                Autenticación instantánea mediante token de BotFather. Re-suscripción automática y soporte de multimedia.
                            </p>
                        </div>

                        {/* Web Chat SDK */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-[#00B4DB]/10 flex items-center justify-center p-1.5 border border-[#00B4DB]/10">
                                        <Image src={webIcon} alt="Web Widget" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-sm font-bold text-white">Web Chat SDK</span>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded uppercase">Activo</span>
                            </div>
                            <p className="text-xs text-[#A6B3C4] leading-relaxed">
                                Widget molecular de chat instalable mediante script asíncrono. Carga en paralelo sin afectar rendimiento de web.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Changelog & Version History */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-white tracking-tight">Historial de Versiones</h3>
                    <div className="space-y-4">
                        {/* Version 3.0.4 */}
                        <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 relative">
                            <div className="absolute top-6 right-6 text-xs text-slate-500 font-bold">15 de Junio, 2026</div>
                            <div className="flex items-center gap-3">
                                <span className="text-base font-black text-white">Versión 3.0.4</span>
                                <span className="px-2 py-0.5 bg-[#00B4DB]/20 text-[#00B4DB] text-[8px] font-black rounded uppercase">Actual</span>
                            </div>
                            <ul className="mt-4 space-y-2 text-xs text-[#A6B3C4] list-disc list-inside">
                                <li>Rediseño completo de la barra lateral (Sidebar) colapsable con persistencia en localStorage.</li>
                                <li>Alineación e incremento de tamaño de logos e insignias oficiales de Skylab y Synerg-IA.</li>
                                <li>Integración de tutorial dinámico interactivo (Meta Console Simulator) en el Hub de Integraciones.</li>
                                <li>Ocultamiento dinámico del Onboarding de herramientas si el tenant ya existe.</li>
                                <li>Nuevas páginas exclusivas de Configuración y Acerca de con representaciones oficiales de marcas.</li>
                            </ul>
                        </div>

                        {/* Version 3.0.0 */}
                        <div className="bg-[#0B0F17]/60 border border-white/5 rounded-2xl p-6 relative">
                            <div className="absolute top-6 right-6 text-xs text-slate-600 font-bold">12 de Mayo, 2026</div>
                            <div className="flex items-center gap-3">
                                <span className="text-base font-bold text-slate-400">Versión 3.0.0</span>
                                <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[8px] font-black rounded uppercase">Lanzamiento</span>
                            </div>
                            <ul className="mt-4 space-y-2 text-xs text-slate-500 list-disc list-inside">
                                <li>Módulos de Bot DNA Builder, Bot Tester y CRM funcional conectado a base de datos.</li>
                                <li>Aislamiento de seguridad multi-tenant (RLS) en PostgreSQL.</li>
                                <li>Integración inicial de Gemini Flash y base de conocimiento.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 border-t border-white/10 pt-8">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Desarrollado con</span>
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
                        <span>por <strong className="text-[#00B4DB]">Synerg-IA Automation</strong> en Medellín, Colombia.</span>
                    </div>
                    <span>© {new Date().getFullYear()} Synerg-IA. Todos los derechos reservados.</span>
                </div>
            </div>
        </div>
    )
}
