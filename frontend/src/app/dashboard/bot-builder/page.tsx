'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import {
    Sparkles,
    Palette,
    Save,
    RefreshCw,
    Smartphone,
    Bot,
    Zap,
    CheckCircle2,
    Cpu,
    Fingerprint,
    Layers,
    Dna,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const TONES = [
    { id: 'paisa', name: 'Paisa (Cálido)', description: 'Amable, cercano, usa regionalismos.', flavor: '¡Qué nota saludarlo, mor! ¿En qué le ayudo pues?' },
    { id: 'friendly', name: 'Amigable', description: 'Cercano y entusiasta.', flavor: '¡Hola! Qué gusto saludarte hoy. 😊👋' },
    { id: 'formal', name: 'Formal', description: 'Profesional y ejecutivo.', flavor: 'Buen día. ¿Cómo puedo asistirle en su requerimiento?' },
    { id: 'expert', name: 'Experto', description: 'Técnico y altamente capacitado.', flavor: 'Procesando consulta... La solución optimizada es la siguiente.' },
];

export default function BotBuilderPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [config, setConfig] = useState({
        name: 'Skylab Assistant',
        tone: 'paisa',
        emojis: 'high',
        prompt: 'Eres un asistente experto en...',
        avatarUrl: '',
        color_theme: '#00B4DB',
        human_level: 80,
        humanization_enabled: true,
        split_messages: true,
        words_per_minute: 60,
        max_chars_per_fragment: 180,
        customInstructions: ''
    });

    const [tenantInfo, setTenantInfo] = useState({
        name: 'Mi Empresa',
        templatePrompt: 'Eres un asistente servicial.'
    });

    const supabase = createClient();
    const [botId, setBotId] = useState<string | null>(null);

    // Chat scroll reference
    const chatContainerRef = React.useRef<HTMLDivElement>(null);

    // Conversational Simulation Engine (Visual Feedback Loop)
    const [simMessages, setSimMessages] = useState<{ sender: 'user' | 'bot'; text: string; id: string }[]>([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [simStep, setSimStep] = useState(0);

    const getDialogue = (tone: string) => {
        const dialogues = {
            paisa: {
                user1: "Hola, ¿tienen citas de valoración hoy?",
                bot1_1: "¡Qué nota saludarte, mor! Claro que sí, tenemos citas disponibles para esta misma semana.",
                bot1_2: "Regálame tu nombre completo y tu WhatsApp para agendarte de una. ¿Prefieres en la mañana o en la tarde?",
                bot1_combined: "¡Qué nota saludarte, mor! Claro que sí, tenemos citas disponibles para esta misma semana. Regálame tu nombre completo y tu WhatsApp para agendarte de una. ¿Prefieres en la mañana o en la tarde?",
                user2: "En la tarde me queda súper bien, soy Juan y mi cel es 3123456789.",
                bot2_1: "Listo Juan, de una. Ya te separé el espacio para mañana por la tarde.",
                bot2_2: "Te escribimos al WhatsApp 3123456789 para confirmar la hora exacta. ¡Un abrazo mor!",
                bot2_combined: "Listo Juan, de una. Ya te separé el espacio para mañana por la tarde. Te escribimos al WhatsApp 3123456789 para confirmar la hora exacta. ¡Un abrazo mor!"
            },
            friendly: {
                user1: "Hola, ¿tienen citas de valoración hoy?",
                bot1_1: "¡Hola! Qué gusto saludarte hoy. 😊 Claro que sí, tenemos citas disponibles para esta semana.",
                bot1_2: "Por favor, compárteme tu nombre completo y tu número celular para agendarte. ¿Te queda mejor en la mañana o en la tarde?",
                bot1_combined: "¡Hola! Qué gusto saludarte hoy. 😊 Claro que sí, tenemos citas disponibles para esta semana. Por favor, compárteme tu nombre completo y tu número celular para agendarte. ¿Te queda mejor en la mañana o en la tarde?",
                user2: "En la tarde me queda súper bien, soy Juan y mi cel es 3123456789.",
                bot2_1: "¡Perfecto Juan! Ya reservé tu cupo para mañana por la tarde. 😊",
                bot2_2: "Te enviaremos un WhatsApp al 3123456789 para confirmar la hora exacta. ¡Que tengas un lindo día! 😊",
                bot2_combined: "¡Perfecto Juan! Ya reservé tu cupo para mañana por la tarde. 😊 Te enviaremos un WhatsApp al 3123456789 para confirmar la hora exacta. ¡Que tengas un lindo día! 😊"
            },
            formal: {
                user1: "Hola, ¿tienen citas de valoración hoy?",
                bot1_1: "Buen día. Es un placer saludarle. Por supuesto, contamos con disponibilidad de citas para esta semana.",
                bot1_2: "Agradezco que me proporcione su nombre completo y número de contacto para registrar su solicitud. ¿Prefiere horario matutino o vespertino?",
                bot1_combined: "Buen día. Es un placer saludarle. Por supuesto, contamos con disponibilidad de citas para esta semana. Agradezco que me proporcione su nombre completo y número de contacto para registrar su solicitud. ¿Prefiere horario matutino o vespertino?",
                user2: "En la tarde me queda súper bien, soy Juan y mi cel es 3123456789.",
                bot2_1: "Entendido, Don Juan. Hemos reservado su espacio de valoración para el día de mañana en la tarde.",
                bot2_2: "Le contactaremos al número 3123456789 para confirmar la hora exacta de su cita. Quedamos a su entera disposición.",
                bot2_combined: "Entendido, Don Juan. Hemos reservado su espacio de valoración para el día de mañana en la tarde. Le contactaremos al número 3123456789 para confirmar la hora exacta de su cita. Quedamos a su entera disposición."
            },
            expert: {
                user1: "Hola, ¿tienen citas de valoración hoy?",
                bot1_1: "Saludos. Consulta de disponibilidad procesada. Confirmamos cupos de diagnóstico dental para este ciclo semanal.",
                bot1_2: "Ingrese nombre completo y celular para procesar el registro de valoración clínica. Seleccione preferencia: bloque mañana (AM) o tarde (PM).",
                bot1_combined: "Saludos. Consulta de disponibilidad procesada. Confirmamos cupos de diagnóstico dental para este ciclo semanal. Ingrese nombre completo y celular para procesar el registro de valoración clínica. Seleccione preferencia: bloque mañana (AM) o tarde (PM).",
                user2: "En la tarde me queda súper bien, soy Juan y mi cel es 3123456789.",
                bot2_1: "Registro exitoso. Espacio clínico reservado para el paciente Juan para el día de mañana en bloque vespertino.",
                bot2_2: "Se enviará notificación de confirmación horaria vía SMS/WhatsApp al 3123456789. Fin del proceso de agendamiento.",
                bot2_combined: "Registro exitoso. Espacio clínico reservado para el paciente Juan para el día de mañana en bloque vespertino. Se enviará notificación de confirmación horaria vía SMS/WhatsApp al 3123456789. Fin del proceso de agendamiento."
            }
        };
        return (dialogues as any)[tone] || dialogues.friendly;
    };

    const formatText = (text: string) => {
        if (config.emojis === 'none') {
            return text.replace(/[☀-➿]|[-]|�[�-�]|�[�-�]|[‑-⛿]|�[�-�]/g, '');
        }
        return text;
    };

    useEffect(() => {
        // Restart loop when settings change
        setSimStep(0);
        setSimMessages([]);
        setIsBotTyping(false);
    }, [config.tone, config.split_messages, config.emojis]);

    // Scroll to bottom on message updates
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [simMessages, isBotTyping]);

    useEffect(() => {
        let active = true;
        let timer: any;

        const dialogue = getDialogue(config.tone);
        const ppmSpeed = config.words_per_minute || 60;
        const typingDelay = Math.max(1000, Math.min(3000, (60 / ppmSpeed) * 2000));

        const runSimulation = () => {
            if (!active) return;

            if (simStep === 0) {
                setSimMessages([]);
                timer = setTimeout(() => {
                    if (!active) return;
                    setSimMessages([{ sender: 'user', text: dialogue.user1, id: 'u1' }]);
                    setSimStep(1);
                }, 2000);
            } 
            else if (simStep === 1) {
                timer = setTimeout(() => {
                    if (!active) return;
                    setIsBotTyping(true);
                    setSimStep(2);
                }, 2500);
            }
            else if (simStep === 2) {
                timer = setTimeout(() => {
                    if (!active) return;
                    setIsBotTyping(false);
                    
                    if (config.split_messages) {
                        setSimMessages(prev => [
                            ...prev, 
                            { sender: 'bot', text: formatText(dialogue.bot1_1), id: 'b1_1' }
                        ]);
                        setSimStep(3);
                    } else {
                        setSimMessages(prev => [
                            ...prev,
                            { sender: 'bot', text: formatText(dialogue.bot1_combined), id: 'b1_c' }
                        ]);
                        setSimStep(5);
                    }
                }, Math.max(1500, typingDelay));
            }
            else if (simStep === 3) {
                timer = setTimeout(() => {
                    if (!active) return;
                    setIsBotTyping(true);
                    setSimStep(4);
                }, 3000);
            }
            else if (simStep === 4) {
                timer = setTimeout(() => {
                    if (!active) return;
                    setIsBotTyping(false);
                    setSimMessages(prev => [
                        ...prev,
                        { sender: 'bot', text: formatText(dialogue.bot1_2), id: 'b1_2' }
                    ]);
                    setSimStep(5);
                }, Math.max(1500, typingDelay));
            }
            else if (simStep === 5) {
                timer = setTimeout(() => {
                    if (!active) return;
                    setSimMessages(prev => [
                        ...prev,
                        { sender: 'user', text: dialogue.user2, id: 'u2' }
                    ]);
                    setSimStep(6);
                }, 5000);
            }
            else if (simStep === 6) {
                timer = setTimeout(() => {
                    if (!active) return;
                    setIsBotTyping(true);
                    setSimStep(7);
                }, 2500);
            }
            else if (simStep === 7) {
                timer = setTimeout(() => {
                    if (!active) return;
                    setIsBotTyping(false);
                    
                    if (config.split_messages) {
                        setSimMessages(prev => [
                            ...prev,
                            { sender: 'bot', text: formatText(dialogue.bot2_1), id: 'b2_1' }
                        ]);
                        setSimStep(8);
                    } else {
                        setSimMessages(prev => [
                            ...prev,
                            { sender: 'bot', text: formatText(dialogue.bot2_combined), id: 'b2_c' }
                        ]);
                        setSimStep(10);
                    }
                }, Math.max(1500, typingDelay));
            }
            else if (simStep === 8) {
                timer = setTimeout(() => {
                    if (!active) return;
                    setIsBotTyping(true);
                    setSimStep(9);
                }, 3000);
            }
            else if (simStep === 9) {
                timer = setTimeout(() => {
                    if (!active) return;
                    setIsBotTyping(false);
                    setSimMessages(prev => [
                        ...prev,
                        { sender: 'bot', text: formatText(dialogue.bot2_2), id: 'b2_2' }
                    ]);
                    setSimStep(10);
                }, Math.max(1500, typingDelay));
            }
            else if (simStep === 10) {
                timer = setTimeout(() => {
                    if (!active) return;
                    setSimStep(0);
                }, 12000);
            }
        };

        runSimulation();

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [simStep, config.tone, config.split_messages, config.emojis]);

    useEffect(() => {
        const loadBotData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Get active tenant id safely in browser context
                let activeTenantId = null
                const cookies = typeof window !== 'undefined' ? document.cookie.split('; ').reduce((acc, c) => {
                    const [k, v] = c.split('=')
                    if (k) acc[k] = v
                    return acc
                }, {} as any) : {}
                const impersonatedId = cookies['impersonate_tenant_id']

                if (impersonatedId) {
                    const { data: superAdmin } = await supabase
                        .from('super_admins')
                        .select('*')
                        .eq('user_id', user.id)
                        .maybeSingle()
                    if (superAdmin) {
                        activeTenantId = impersonatedId
                    }
                }

                if (!activeTenantId) {
                    const { data: roleData } = await supabase
                        .from('user_roles')
                        .select('tenant_id')
                        .eq('user_id', user.id)
                        .maybeSingle()
                    activeTenantId = roleData?.tenant_id || null
                }

                const roles = { tenant_id: activeTenantId }

                if (roles?.tenant_id) {
                    // Fetch tenant details for prompt compiling
                    const { data: tenant } = await supabase
                        .from('tenants')
                        .select('name, industry')
                        .eq('id', roles.tenant_id)
                        .maybeSingle();

                    let templatePrompt = '';
                    if (tenant?.industry) {
                        const { data: template } = await supabase
                            .from('bot_templates')
                            .select('base_system_prompt')
                            .eq('vertical_name', tenant.industry)
                            .maybeSingle();
                        if (template) {
                            templatePrompt = template.base_system_prompt;
                        }
                    }

                    setTenantInfo({
                        name: tenant?.name || 'Mi Empresa',
                        templatePrompt: templatePrompt || 'Eres un asistente servicial.'
                    });

                    const { data: bot } = await supabase
                        .from('bots')
                        .select('*')
                        .eq('tenant_id', roles.tenant_id)
                        .maybeSingle()

                    if (bot) {
                        setBotId(bot.id);
                        setConfig({
                            name: bot.name || 'Skylab Assistant',
                            tone: bot.tone_style || 'friendly',
                            emojis: bot.use_emojis || 'high',
                            prompt: bot.system_prompt || 'Eres un asistente...',
                            avatarUrl: bot.avatar_url || '',
                            color_theme: bot.color_theme || '#00B4DB',
                            human_level: 80,
                            humanization_enabled: bot.humanization_enabled ?? true,
                            split_messages: bot.split_messages ?? true,
                            words_per_minute: bot.words_per_minute || 60,
                            max_chars_per_fragment: bot.max_chars_per_fragment || 180,
                            customInstructions: bot.custom_instructions || ''
                        })
                    }
                }
            } catch (error) {
                console.error("Error loading bot config:", error);
            }
        };

        loadBotData();
    }, [supabase]);

    const handleCompilePrompt = () => {
        if (!tenantInfo.templatePrompt) {
            toast.error("No se pudo cargar la plantilla base de tu sector.");
            return;
        }
        
        let compiled = `${tenantInfo.templatePrompt}

### INFORMACIÓN Y CONTEXTO DEL NEGOCIO:
- **Nombre de la Empresa**: ${tenantInfo.name}
`;
        if (config.customInstructions.trim()) {
            compiled += `\n### DIRECTRICES Y SUGERENCIAS DEL CREADOR (REGLAS DE NEGOCIO):\n`;
            const lines = config.customInstructions.split('\n').filter((l: string) => l.trim());
            for (const line of lines) {
                compiled += `- ${line}\n`;
            }
        }
        
        setConfig(prev => ({ ...prev, prompt: compiled }));
        toast.success("Matriz de Comportamiento regenerada con éxito.");
    };

    const handleSave = async () => {
        setIsSaving(true);
        if (!botId) {
            toast.error("No se detecta un Bot en tu cuenta.");
            setIsSaving(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('bots')
                .update({
                    name: config.name,
                    tone_style: config.tone,
                    use_emojis: config.emojis,
                    system_prompt: config.prompt,
                    humanization_enabled: config.humanization_enabled,
                    split_messages: config.split_messages,
                    words_per_minute: config.words_per_minute,
                    max_chars_per_fragment: config.max_chars_per_fragment,
                    custom_instructions: config.customInstructions
                })
                .eq('id', botId);

            if (error) throw error;
            toast.success("Sincronización completa con éxito.");
        } catch (error) {
            console.error("Error al guardar:", error);
            toast.error("Fallo en la sincronización.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#070A0F] text-white relative">
            <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-[#00B4DB]/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Premium Header */}
            <header className="h-24 border-b border-white/10 bg-[#070A0F]/80 backdrop-blur-2xl flex items-center justify-between px-10 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-[20px] shadow-2xl flex items-center justify-center text-[#070A0F]">
                        <Cpu className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter">Bot DNA Builder</h1>
                        <p className="text-[10px] font-bold text-[#00B4DB] uppercase tracking-widest mt-0.5">Módulo de Personalidad v4.5</p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#00B4DB] hover:bg-[#26C7EA] text-[#061018] rounded-xl px-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#00B4DB]/20 gap-3 h-12 transition-all hover:scale-[1.02] active:scale-95"
                >
                    {isSaving ? 'Sincronizando...' : <><Save className="w-4 h-4" /> Guardar Cambios</>}
                </Button>
            </header>

            <main className="flex-1 overflow-y-auto w-full max-w-[1700px] mx-auto px-10 pt-3 pb-10 space-y-12">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-8 space-y-10">
                        
                        {/* Core Identity Card */}
                        <div className="bg-[#0B0F17] border border-white/10 rounded-[32px] p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4DB]/5 blur-[100px] rounded-full pointer-events-none" />

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-[#00B4DB]/10 rounded-2xl flex items-center justify-center text-[#00B4DB] border border-[#00B4DB]/20">
                                    <Fingerprint className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Identidad Primaria</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Asistente</Label>
                                    <Input
                                        value={config.name}
                                        onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                        className="bg-[#070A0F] border border-white/10 h-14 px-5 rounded-2xl focus:ring-[#00B4DB]/50 focus:border-[#00B4DB] text-lg font-bold text-white placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Espectro de Color</Label>
                                    <div className="flex bg-[#070A0F] p-2 rounded-2xl border border-white/10 gap-3 h-14 items-center">
                                        {['#475569', '#00B4DB', '#10b981', '#f59e0b', '#dc2626', '#d946ef'].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setConfig({ ...config, color_theme: color })}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${config.color_theme === color ? 'border-white scale-110 shadow-lg ring-2 ring-[#00B4DB]/50' : 'border-transparent scale-90 opacity-60 hover:opacity-100'}`}
                                                style={{ backgroundColor: color }}
                                                aria-label={`Color ${color}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instrucciones y Reglas de Negocio (Sugerencias del Creador)</Label>
                                <Textarea
                                    value={config.customInstructions}
                                    onChange={(e) => setConfig(prev => ({ ...prev, customInstructions: e.target.value }))}
                                    className="min-h-[100px] bg-[#070A0F] border border-white/10 p-5 rounded-2xl text-slate-300 font-medium resize-none text-sm leading-relaxed placeholder:text-slate-600 focus:ring-1 focus:ring-[#00B4DB]/50 focus:border-[#00B4DB]"
                                    placeholder="Ej: 'No des precios de tratamientos por chat', 'Destaca que la valoración inicial de ortodoncia es gratuita' o 'Ofrece parqueadero gratis a clientes'."
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matriz de Comportamiento (System Prompt)</Label>
                                    <button 
                                        onClick={handleCompilePrompt}
                                        type="button"
                                        title="Compilar y Regenerar Prompt con tus Reglas"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00B4DB]/10 hover:bg-[#00B4DB]/20 border border-[#00B4DB]/30 rounded-xl text-[#00B4DB] text-[10px] font-bold uppercase tracking-wider transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Regenerar Prompt
                                    </button>
                                </div>
                                <Textarea
                                    value={config.prompt}
                                    onChange={(e) => setConfig(prev => ({ ...prev, prompt: e.target.value }))}
                                    className="min-h-[220px] bg-[#070A0F] border border-white/10 p-5 rounded-2xl text-slate-300 font-medium resize-none text-sm leading-relaxed placeholder:text-slate-600 focus:ring-1 focus:ring-[#00B4DB]/50 focus:border-[#00B4DB]"
                                    placeholder="Define la razón de ser de tu bot..."
                                />
                            </div>
                        </div>

                        {/* Tone & Frequency */}
                        <div className="bg-[#0B0F17] border border-white/10 rounded-[32px] p-10 shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-[#00B4DB]/10 rounded-2xl flex items-center justify-center text-[#00B4DB] border border-[#00B4DB]/20">
                                    <Dna className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Frecuencia Vocal</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {TONES.map((tone) => (
                                    <button
                                        key={tone.id}
                                        onClick={() => setConfig({ ...config, tone: tone.id })}
                                        className={`p-6 rounded-[24px] text-left transition-all duration-300 border ${config.tone === tone.id ? 'bg-[#00B4DB]/10 text-white border-[#00B4DB]/30 shadow-lg' : 'bg-[#070A0F] border border-white/5 hover:border-[#00B4DB]/30 text-slate-400 hover:text-white'}`}
                                    >
                                        <h4 className="font-black text-lg mb-1">{tone.name}</h4>
                                        <p className="text-xs font-medium text-slate-500">{tone.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Humanization Engine Config */}
                        <div className="bg-[#0B0F17] border border-white/10 rounded-[32px] p-10 shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#00B4DB]/10 rounded-2xl flex items-center justify-center text-[#00B4DB] border border-[#00B4DB]/20">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Humanization Engine</h3>
                                </div>
                                <div className="flex items-center gap-3 bg-[#070A0F] p-2 rounded-2xl border border-white/10">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-3">{config.humanization_enabled ? 'Activado' : 'Desactivado'}</span>
                                    <button 
                                        onClick={() => setConfig({ ...config, humanization_enabled: !config.humanization_enabled })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${config.humanization_enabled ? 'bg-[#00B4DB]' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.humanization_enabled ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {config.humanization_enabled && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-8 overflow-hidden"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fraccionamiento de Mensajes</Label>
                                                    <button 
                                                        onClick={() => setConfig({ ...config, split_messages: !config.split_messages })}
                                                        className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${config.split_messages ? 'bg-[#00B4DB]/10 text-[#00B4DB] border border-[#00B4DB]/20' : 'bg-[#070A0F] border border-white/5 text-slate-500'}`}
                                                    >
                                                        {config.split_messages ? 'On' : 'Off'}
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-slate-500 leading-relaxed">Divide respuestas largas en burbujas pequeñas para una apariencia más humana y natural.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Velocidad de Escritura (PPM)</Label>
                                                    <span className="text-sm font-black text-[#00B4DB]">{config.words_per_minute}</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="30" max="150" step="5"
                                                    value={config.words_per_minute}
                                                    onChange={(e) => setConfig({ ...config, words_per_minute: parseInt(e.target.value) })}
                                                    className="w-full h-2 bg-[#070A0F] rounded-lg appearance-none cursor-pointer accent-[#00B4DB]"
                                                />
                                                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                                                    <span>Lento</span>
                                                    <span>Normal</span>
                                                    <span>Veloz</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-[#070A0F] rounded-[24px] border border-white/5">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuración Avanzada</h4>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Máximo de Caracteres por Burbuja</Label>
                                                <div className="flex gap-4 items-center">
                                                    <input 
                                                        type="number" 
                                                        value={config.max_chars_per_fragment}
                                                        onChange={(e) => setConfig({ ...config, max_chars_per_fragment: parseInt(e.target.value) })}
                                                        className="w-24 bg-[#0B0F17] border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#00B4DB]"
                                                    />
                                                    <span className="text-[10px] text-slate-500 uppercase font-medium">Recomendado: 150-250 caracteres</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Simulation Console */}
                    <div className="xl:col-span-4">
                        <div className="sticky top-3 max-h-[calc(100vh-130px)] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" /> Consola de Simulación
                                </h3>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-80 hover:opacity-100 transition-opacity" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-80 hover:opacity-100 transition-opacity" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-80 hover:opacity-100 transition-opacity" />
                                </div>
                            </div>

                            <div className="relative w-full h-[600px] bg-[#0B0F17] rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col group">
                                <div className="h-12 bg-white/5 flex items-center justify-center pt-3 relative">
                                    {/* Dynamic Island Style Camera Capsule */}
                                    <div className="w-24 h-5 bg-black/80 rounded-full border border-white/5 flex items-center justify-between px-2.5 text-[8px] text-white/45 shadow-inner">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00B4DB]/60 animate-pulse" />
                                        <div className="w-7 h-1 bg-white/10 rounded-full" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                                    </div>
                                </div>

                                <div className="py-3 px-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                    <div className="flex items-center gap-3">
                                        {/* Back arrow indicator for realistic chat style */}
                                        <div className="text-slate-500 text-xs font-bold mr-1">&lt;</div>
                                        
                                        {/* Avatar with dynamic ring using brand symbol icon */}
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#070B12] border border-white/10 shadow-md overflow-hidden">
                                                <img 
                                                    src="/brand/skylab-symbol-transparent.png" 
                                                    alt="Skylab Symbol" 
                                                    className="w-full h-full object-contain scale-[1.8] translate-x-[9.67%] select-none pointer-events-none"
                                                    style={{ transformOrigin: 'center' }}
                                                />
                                            </div>
                                            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#27C93F] border-2 border-[#0B0F17] rounded-full animate-pulse" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-white tracking-tight">{config.name}</div>
                                            <div className="text-[8px] text-[#00B4DB] font-bold uppercase tracking-widest mt-0.5">En línea</div>
                                        </div>
                                    </div>
                                    
                                    {/* Action icons */}
                                    <div className="flex items-center gap-3.5 text-slate-400">
                                        {/* Call Icon (minimalist svg) */}
                                        <svg className="w-3.5 h-3.5 hover:text-white transition-colors cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {/* Video Call Icon */}
                                        <svg className="w-3.5 h-3.5 hover:text-white transition-colors cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>

                                <div ref={chatContainerRef} className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-[#070A0F] flex flex-col justify-end min-h-[380px] scrollbar-none">
                                    <AnimatePresence>
                                        {simMessages.map((msg) => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`self-${msg.sender === 'user' ? 'end' : 'start'} max-w-[85%] p-4 rounded-2xl text-xs font-medium shadow-sm transition-all duration-300 ${
                                                    msg.sender === 'user'
                                                        ? 'bg-white/[0.05] text-[#A6B3C4] border border-white/5 rounded-br-none'
                                                        : 'bg-[#00B4DB]/10 text-white border border-[#00B4DB]/20 rounded-bl-none'
                                                }`}
                                            >
                                                {msg.text}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {isBotTyping && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className="self-start max-w-[85%] bg-[#00B4DB]/10 border border-[#00B4DB]/20 p-4 rounded-2xl rounded-bl-none shadow-lg flex items-center gap-1.5"
                                        >
                                            <span className="w-1.5 h-1.5 bg-[#00B4DB] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-[#00B4DB] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-[#00B4DB] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </motion.div>
                                    )}
                                </div>

                                <div className="p-3 bg-[#0B0F17] border-t border-white/5 mt-auto flex items-center gap-2">
                                    <div className="flex-1 h-9 bg-[#070A0F] rounded-xl border border-white/10 px-3 flex items-center text-slate-600 text-[10px]">
                                        Escribe un mensaje para testear...
                                    </div>
                                    {/* Send button icon */}
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer" style={{ backgroundColor: config.color_theme }}>
                                        <svg className="w-3.5 h-3.5 text-[#070A0F]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#00B4DB]/10 border border-[#00B4DB]/20 p-6 rounded-[24px] flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#00B4DB]/20 flex items-center justify-center text-[#00B4DB]">
                                    <Activity className="w-5 h-5 animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-black uppercase text-white">Pruebas en Vivo</h4>
                                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                                        Usa la pestaña <strong>Bot Tester</strong> en el menú lateral para interactuar en tiempo real con Gemini usando tu System Prompt actual.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
