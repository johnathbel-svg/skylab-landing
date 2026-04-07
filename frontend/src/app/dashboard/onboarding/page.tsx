'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import {
    Building2,
    TrendingUp,
    Sparkles,
    ChevronDown,
    ChevronRight,
    Check,
    ArrowRight,
    Target,
    Rocket,
    ShieldCheck,
    Globe,
    ArrowLeft,
    Bot,
    Zap,
    MessageSquareText,
    Cpu,
    Atom
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { saveOnboardingAction, getTemplatesAction } from './actions';
import { toast } from 'sonner';

const STEPS = [
    { id: 'business', title: 'Tu Universo', subtitle: 'Hablemos de tu reino', icon: Rocket },
    { id: 'dimension', title: 'Dimensiones', subtitle: 'Escalando el impacto', icon: TrendingUp },
    { id: 'identity', title: 'Esencia IA', subtitle: 'El alma del bot', icon: Sparkles },
    { id: 'plan', title: 'Destino', subtitle: 'Tu plan estelar', icon: Target },
];

const PREVIEWS: Record<string, string> = {
    paisa: "¡Qué más pues! Soy {name}, estoy listo para camellar con vos y atender a tus clientes con toda la energía.",
    friendly: "¡Hola! Soy {name}, tu nuevo asistente. Estoy aquí para hacer que la experiencia de tus clientes sea increíble.",
    formal: "Saludos. Soy {name}. Es un placer presentarme como el asistente oficial de su organización. ¿En qué puedo asistirle hoy?",
};

export default function OnboardingDashboardPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    
    const [formData, setFormData] = useState({
        businessName: '',
        industry: '', // This will hold the template ID or vertical name
        monthlySales: '',
        interactions: '',
        botName: '',
        tone: 'paisa',
        useEmojis: 'high'
    });
    
    // Store answers for the dynamic quick questions
    const [answers, setAnswers] = useState<Record<string, any>>({});

    useEffect(() => {
        getTemplatesAction().then(res => {
            if (res.success) setTemplates(res.data);
            setIsLoadingTemplates(false);
        });
    }, []);

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const selectedTemplate = templates.find(t => t.vertical_name === formData.industry);

    const calculateSuggestedPlan = () => {
        const sales = parseInt(formData.monthlySales) || 0;
        const interactions = parseInt(formData.interactions) || 0;

        if (sales > 50000000 || interactions > 5000) return { id: 'intergalactico', name: 'Intergaláctico', sub: 'Enterprise', price: 'Personalizado', color: 'from-purple-600 via-indigo-700 to-blue-800' };
        if (sales > 10000000 || interactions > 1000) return { id: 'nebulosa', name: 'Nebulosa Pro', sub: 'Business', price: '$299k/mes', color: 'from-blue-600 via-cyan-600 to-teal-600' };
        return { id: 'estrella', name: 'Estrella Base', sub: 'Starter', price: '$99k/mes', color: 'from-emerald-500 via-teal-500 to-cyan-600' };
    };

    const plan = calculateSuggestedPlan();

    const handleFinalize = async () => {
        setIsSaving(true);
        // Combine formData with answers for the generation endpoint later
        const result = await saveOnboardingAction({
            ...formData,
            suggestedPlan: plan.id,
            templateId: selectedTemplate?.id,
            answers
        });
        
        setIsSaving(false);
        if (result.success) {
            toast.success("¡Protocolo de inicio completado!");
            router.refresh();
            router.push('/dashboard');
        } else {
            toast.error(result.error);
        }
    };

    const renderBotMessage = () => {
        const template = PREVIEWS[formData.tone as keyof typeof PREVIEWS] || PREVIEWS.friendly;
        return template.replace('{name}', formData.botName || 'Skylab Bot');
    };

    // Helper to render dynamic Lucide icons
    const renderIcon = (iconName: string, className: string) => {
        const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Bot;
        return <IconComponent className={className} />;
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center p-6 relative py-20 overflow-x-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse opacity-50" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse opacity-50 transition-all duration-1000" />
                <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full" />
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <div className="w-full max-w-6xl relative z-10 space-y-16">
                <header className="text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl"
                    >
                        <Atom className="w-4 h-4 animate-spin-slow" /> Configuración Molecular
                    </motion.div>
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500 leading-none">
                            Tu Viaje Comienza
                        </h1>
                        <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
                            Definamos la estructura genética de tu organización en el ecosistema Skylab.
                        </p>
                    </div>
                </header>

                <nav className="flex justify-between items-center relative px-10 max-w-4xl mx-auto" aria-label="Progreso de configuración">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 z-0" />
                    <motion.div
                        className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 -translate-y-1/2 z-0 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    />
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                                <motion.button
                                    onClick={() => idx < currentStep && setCurrentStep(idx)}
                                    animate={isCurrent ? {
                                        boxShadow: ["0 0 0px rgba(99,102,241,0)", "0 0 40px rgba(99,102,241,0.2)", "0 0 0px rgba(99,102,241,0)"]
                                    } : {}}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${isActive
                                        ? 'bg-slate-900 text-white border-indigo-500 shadow-xl shadow-indigo-900/20'
                                        : 'bg-slate-950 text-slate-700 border-white/5 hover:border-white/10'
                                        } ${idx < currentStep ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    {idx < currentStep ? (
                                        <Check className="w-7 h-7 stroke-[4px] text-emerald-400" />
                                    ) : (
                                        <Icon className={`w-7 h-7 ${isCurrent ? 'text-indigo-400' : ''}`} />
                                    )}
                                </motion.button>
                                <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap hidden md:block text-center">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isCurrent ? 'text-white' : 'text-slate-600'}`}>{step.title}</span>
                                </div>
                            </div>
                        );
                    })}
                </nav>

                <div className="bg-slate-900/20 backdrop-blur-3xl border border-white/10 rounded-[48px] p-8 md:p-16 shadow-[0_32px_100px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[620px] flex flex-col">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="flex-1 flex flex-col justify-center"
                        >
                            {currentStep === 0 && (
                                <div className="max-w-4xl mx-auto w-full space-y-12">
                                    <div className="space-y-4 text-center">
                                        <div className="flex justify-center items-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-[0.3em]">
                                            <Building2 className="w-4 h-4" /> Paso 01 / 04
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Identidad y Vertical</h2>
                                        <p className="text-slate-400 text-lg font-medium">Establece tu nombre y selecciona el nicho operativo.</p>
                                    </div>

                                    <div className="space-y-10 mt-12">
                                        <div className="space-y-4 max-w-2xl mx-auto">
                                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Nombre Corporativo</Label>
                                            <div className="relative group">
                                                <Input
                                                    placeholder="Ej: Inversiones Paisa"
                                                    value={formData.businessName}
                                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                                    className="bg-white/5 border-white/10 h-16 px-8 rounded-3xl focus:ring-2 focus:ring-indigo-500/50 text-xl font-bold placeholder:text-slate-700 transition-all group-hover:bg-white/[0.08] text-center"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 text-center block">Selecciona tu Plantilla Maestra</Label>
                                            {isLoadingTemplates ? (
                                                <div className="h-48 flex items-center justify-center">
                                                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {templates.map((tpl) => (
                                                        <motion.button
                                                            key={tpl.id}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setFormData({ ...formData, industry: tpl.vertical_name })}
                                                            className={`p-6 rounded-[28px] border text-left transition-all ${
                                                                formData.industry === tpl.vertical_name 
                                                                ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-4 mb-4">
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.industry === tpl.vertical_name ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                                                                    {renderIcon(tpl.vertical_icon, 'w-6 h-6')}
                                                                </div>
                                                                <h3 className={`font-bold text-lg ${formData.industry === tpl.vertical_name ? 'text-white' : 'text-slate-300'}`}>
                                                                    {tpl.vertical_name}
                                                                </h3>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-400 line-clamp-3 leading-relaxed">
                                                                {tpl.description}
                                                            </p>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="max-w-3xl mx-auto w-full space-y-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-[0.3em]">
                                            <TrendingUp className="w-4 h-4" /> Paso 02 / 04
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Dimensiones de Escala</h2>
                                        <p className="text-slate-400 text-lg font-medium">Calculamos la potencia de procesamiento según tu volumen operativo.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            className="bg-white/5 border border-white/10 p-10 rounded-[40px] space-y-6 hover:bg-white/[0.08] transition-all relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all" />
                                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Ventas Mensuales (COP)</Label>
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 font-black text-2xl">$</div>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={formData.monthlySales}
                                                    onChange={(e) => setFormData({ ...formData, monthlySales: e.target.value })}
                                                    className="bg-transparent border-none h-auto p-0 text-4xl font-black placeholder:text-slate-800 focus-visible:ring-0 appearance-none"
                                                />
                                            </div>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            className="bg-white/5 border border-white/10 p-10 rounded-[40px] space-y-6 hover:bg-white/[0.08] transition-all relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all" />
                                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Interacciones Proyectadas</Label>
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                                                    <MessageSquareText className="w-7 h-7" />
                                                </div>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={formData.interactions}
                                                    onChange={(e) => setFormData({ ...formData, interactions: e.target.value })}
                                                    className="bg-transparent border-none h-auto p-0 text-4xl font-black placeholder:text-slate-800 focus-visible:ring-0"
                                                />
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="max-w-5xl mx-auto w-full space-y-12">
                                    <div className="text-center space-y-4">
                                        <div className="flex items-center justify-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-[0.3em]">
                                            <Sparkles className="w-4 h-4" /> Paso 03 / 04
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Esencia Molecular</h2>
                                        <p className="text-slate-400 text-lg font-medium">Define la personalidad IA y personaliza tu plantilla <span className="text-indigo-400">{selectedTemplate?.vertical_name}</span>.</p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-12">
                                        {/* Configuration Side */}
                                        <div className="space-y-8">
                                            <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 space-y-8">
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Nombre del Representante</Label>
                                                    <div className="relative group">
                                                        <Input
                                                            placeholder="Ej: Lucía Artificial"
                                                            value={formData.botName}
                                                            onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
                                                            className="bg-slate-900 border-white/10 h-16 px-8 rounded-3xl text-xl font-bold focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                        <Bot className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <Label htmlFor="tone-onboarding" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">ADN Lingüístico (Tono)</Label>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {['paisa', 'friendly', 'formal'].map((t) => (
                                                            <button
                                                                id={`tone-${t}`}
                                                                key={t}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, tone: t })}
                                                                className={`h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.tone === t
                                                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-900/40 translate-y-[-2px]'
                                                                    : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/20'
                                                                    }`}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dynamic Questions Panel */}
                                            {selectedTemplate && selectedTemplate.quick_questions?.length > 0 && (
                                                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-10 rounded-[40px] border border-indigo-500/20 space-y-6">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <Zap className="w-5 h-5 text-indigo-400" />
                                                        <h3 className="font-bold text-lg text-white">Configuración Rápida de Nicho</h3>
                                                    </div>
                                                    {selectedTemplate.quick_questions.map((q: any) => (
                                                        <div key={q.id} className="space-y-3">
                                                            <Label className="text-xs font-bold text-indigo-200">{q.question}</Label>
                                                            {q.type === 'boolean' ? (
                                                                <div className="flex gap-4">
                                                                    <button
                                                                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: true }))}
                                                                        className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${answers[q.id] === true ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-white/5'}`}
                                                                    >
                                                                        Sí, por supuesto
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: false }))}
                                                                        className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${answers[q.id] === false ? 'bg-slate-700 border-slate-500 text-white' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-white/5'}`}
                                                                    >
                                                                        Aún no
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <Input 
                                                                    placeholder="Respuesta corta..." 
                                                                    className="bg-slate-900 border-white/10 h-12 rounded-xl"
                                                                    value={answers[q.id] || ''}
                                                                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Live Preview Side */}
                                        <div className="relative group sticky top-24">
                                            <div className="absolute inset-0 bg-indigo-600/10 blur-[80px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-1000" />
                                            <motion.div
                                                layout
                                                className="relative z-10 w-full p-10 bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-[56px] shadow-2xl backdrop-blur-3xl overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />

                                                <div className="flex flex-col items-center text-center space-y-8">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-indigo-500/40 blur-2xl rounded-full scale-110 opacity-50" />
                                                        <div className="relative w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[32px] flex items-center justify-center shadow-2xl border border-white/20 transform rotate-3 group-hover:rotate-12 transition-transform duration-700">
                                                            <Cpu className="w-12 h-12 text-white" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="text-3xl font-black tracking-tight text-white">{formData.botName || 'Representante Skylab'}</div>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">En Línea • Tono {formData.tone}</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white/5 border border-white/5 p-6 rounded-3xl w-full text-left relative overflow-hidden group/chat">
                                                        <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500 opacity-50" />
                                                        <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                                                            &quot;{renderBotMessage()}&quot;
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="max-w-4xl mx-auto w-full space-y-12 flex flex-col items-center">
                                    <div className="text-center space-y-4">
                                        <div className="flex items-center justify-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-[0.3em]">
                                            <Target className="w-4 h-4" /> Paso Final / 04
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Nivel de Órbita</h2>
                                        <p className="text-slate-400 text-lg font-medium">Asignamos tu cuenta en el clúster ideal para tu operación.</p>
                                    </div>

                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`w-full max-w-md p-1 items-center rounded-[64px] bg-gradient-to-br ${plan.color} relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] group`}
                                    >
                                        <div className="bg-slate-950/80 backdrop-blur-xl m-[2px] rounded-[62px] p-12 space-y-10 relative overflow-hidden h-full">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl pointer-events-none" />

                                            <div className="space-y-4 text-center">
                                                <div className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em]">{plan.sub}</div>
                                                <div className="text-5xl font-black text-white tracking-tighter leading-none">{plan.name}</div>
                                            </div>

                                            <div className="py-8 border-y border-white/5 flex flex-col items-center text-center space-y-2">
                                                <p className="text-6xl font-black text-white">{plan.price}</p>
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Inversión Mensual</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-slate-400 text-sm font-semibold italic">
                                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Cifrado Molecular 256-bit
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400 text-sm font-semibold italic">
                                                    <Zap className="w-4 h-4 text-yellow-400" /> Prioridad de Inferencia Gold
                                                </div>
                                                {selectedTemplate && (
                                                <div className="flex items-center gap-3 text-slate-400 text-sm font-semibold italic">
                                                    <Bot className="w-4 h-4 text-indigo-400" /> Configuración: {selectedTemplate.vertical_name}
                                                </div>
                                                )}
                                            </div>

                                            <Button
                                                onClick={handleFinalize}
                                                disabled={isSaving}
                                                className="w-full bg-white text-black hover:bg-slate-200 h-20 text-xl font-black rounded-[28px] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group-hover:shadow-indigo-500/20 disabled:opacity-50"
                                            >
                                                {isSaving ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                        Sincronizando...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        Completar <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>

                                    <div className="flex flex-col items-center gap-2 opacity-40">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">Skylab Protocol • Secure Handshake</p>
                                        <div className="flex gap-1">
                                            {[0.2, 0.4, 0.6, 0.8, 1.0].map(delay => (
                                                <div
                                                    key={delay}
                                                    className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse"
                                                    style={{ animationDelay: `${delay}s` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Nav Buttons Horizontal */}
                            <div className="flex justify-between items-center pt-16 mt-16 border-t border-white/5 w-full relative z-20">
                                <Button
                                    variant="ghost"
                                    onClick={prevStep}
                                    disabled={currentStep === 0 || isSaving}
                                    className="text-slate-500 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] h-14 px-8 rounded-2xl gap-3 disabled:opacity-0 transition-all hover:bg-white/5"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Atrás
                                </Button>

                                {currentStep < 3 && (
                                    <Button
                                        onClick={nextStep}
                                        disabled={currentStep === 0 && !formData.industry}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white h-16 px-12 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 gap-4 group transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                    >
                                        Siguiente <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex justify-center gap-24 opacity-20">
                    <div className="flex items-center gap-2"><Globe className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Escala Global</span></div>
                    <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Triple Respaldo</span></div>
                    <div className="flex items-center gap-2"><Cpu className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Motor Gen-3</span></div>
                </div>
            </div>
        </div>
    );
}
