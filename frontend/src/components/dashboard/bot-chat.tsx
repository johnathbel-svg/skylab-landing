/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from 'react'
import { useChat, Message } from 'ai/react'
import { Bot, Send, User, Loader2, CheckCheck, Trash2, X, MessageSquare, Instagram as InstagramIcon, Globe, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getTestConversationMessages, resetTestConversation } from '@/app/actions/chat-actions'

type Platform = 'web' | 'whatsapp' | 'instagram'

// ==========================================
// B2B AUDIO SYNTH (Zero Assets)
// ==========================================
const playB2BSound = (type: 'send' | 'receive' | 'read') => {
    // Función silenciada por petición del usuario
}

// Emulador de "Visto" (Palomitas Azules)
const ReadReceipt = ({ isHistorical, platform }: { isHistorical?: boolean, platform: Platform }) => {
    const [read, setRead] = useState(isHistorical ? true : false)
    useEffect(() => {
        if (isHistorical) return;
        const t = setTimeout(() => {
            setRead(true)
        }, 800)
        return () => clearTimeout(t)
    }, [isHistorical])

    if (platform === 'instagram') return null;

    return (
        <CheckCheck className={cn(
            "w-3.5 h-3.5 mt-1 self-end transition-colors duration-500",
            platform === 'whatsapp' ? (read ? 'text-[#53bdeb]' : 'text-slate-400') :
                (read ? 'text-sky-300' : 'text-slate-400/50')
        )} />
    )
}

// Burbuja Unificada (Biomimética B2B Silenciosa)
const DelayedBubble = ({ text, isFirst, isHistorical, onVisible, onImageClick, platform = 'web' }: { text: string, isFirst: boolean, isHistorical?: boolean, onVisible?: () => void, onImageClick?: (url: string) => void, platform?: Platform }) => {
    const [visible, setVisible] = useState(isHistorical ? true : false)

    useEffect(() => {
        if (isHistorical) return;
        const t = setTimeout(() => {
            setVisible(true);
            if (onVisible) setTimeout(onVisible, 50);
        }, 300);
        return () => clearTimeout(t);
    }, [onVisible, isHistorical]);

    if (!visible) return null;

    const renderContent = () => {
        const regex = /(!\[.*?\]\(.*?\))/g;
        const parts = text.split(regex);

        return parts.map((part, index) => {
            const imageMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imageMatch) {
                return (
                    <div key={index} onClick={() => onImageClick && onImageClick(imageMatch[2])} className="mt-3 mb-1 bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center p-2 cursor-pointer group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageMatch[2]} alt={imageMatch[1] || 'Bot Image'} className="max-w-full h-auto max-h-[260px] object-contain rounded-lg group-hover:scale-[1.02] group-hover:opacity-95 transition-all duration-300" loading="lazy" />
                    </div>
                );
            } else if (part.trim() !== '') {
                return <span key={index} className="whitespace-pre-wrap leading-relaxed block">{part}</span>;
            }
            return null;
        });
    };

    const getBubbleStyles = () => {
        switch (platform) {
            case 'whatsapp':
                return "bg-white border border-[#e5e7eb] text-[#111b21] rounded-2xl rounded-tl-sm shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] px-3 py-2 text-[14.2px]"
            case 'instagram':
                return "bg-white border border-slate-100 text-[#262626] rounded-[22px] px-4 py-2.5 text-[14px] shadow-sm"
            default:
                return "bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 text-sm"
        }
    }

    return (
        <div className={cn(
            "flex gap-3 justify-start w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
            platform === 'instagram' ? 'px-2' : ''
        )}>
            {platform !== 'whatsapp' && (
                <div className={cn(
                    "w-8 h-8 rounded-full shrink-0",
                    isFirst ? "bg-indigo-100 border border-indigo-200 flex items-center justify-center" : "bg-transparent"
                )}>
                    {isFirst && <Bot className="w-4 h-4 text-indigo-600" />}
                </div>
            )}

            <div className={cn("max-w-[85%] flex flex-col gap-1", getBubbleStyles())}>
                {renderContent()}
            </div>
        </div>
    )
}

const CognitiveTypingBubble = ({ onVisible, platform }: { onVisible?: () => void, platform: Platform }) => {
    const [phase, setPhase] = useState<'typing' | 'paused' | 'retyping'>('typing')

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('paused'), 1500)
        const t2 = setTimeout(() => {
            setPhase('retyping')
            if (onVisible) setTimeout(onVisible, 50)
        }, 2200)
        return () => { clearTimeout(t1); clearTimeout(t2); }
    }, [onVisible])

    if (phase === 'paused') return <div className="h-12" />

    return (
        <div className="flex gap-4 justify-start animate-in fade-in duration-200">
            {platform !== 'whatsapp' && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-600" />
                </div>
            )}
            <div className={cn(
                "px-5 py-4 shadow-sm flex items-center justify-center min-w-[80px]",
                platform === 'whatsapp' ? "bg-white border border-[#e5e7eb] rounded-2xl rounded-tl-sm" :
                    platform === 'instagram' ? "bg-slate-50 border border-slate-200 rounded-[22px]" :
                        "bg-white border border-slate-200 rounded-2xl rounded-tl-sm"
            )}>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                </div>
            </div>
        </div>
    )
}

interface BotChatProps {
    bots: any[]
}

export function BotChat({ bots }: BotChatProps) {
    const [selectedBotId, setSelectedBotId] = useState<string>(bots.length > 0 ? bots[0].id : '')
    const [historicalIds, setHistoricalIds] = useState<Set<string>>(new Set())
    const [isResetting, setIsResetting] = useState(false)
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
    const [platform, setPlatform] = useState<Platform>('web')

    const selectedBot = bots.find(b => b.id === selectedBotId)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        api: '/api/chat',
        body: {
            systemPrompt: selectedBot?.system_prompt || "Eres un asistente virtual útil y profesional.",
            botId: selectedBot?.id
        },
        onError: (error: Error) => {
            alert("Error: " + error.message)
        }
    })

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        let mounted = true
        async function loadHistory() {
            if (!selectedBotId) return
            const { messages: history } = await getTestConversationMessages(selectedBotId)
            if (mounted && history) {
                setHistoricalIds(new Set(history.map((m: any) => m.id)))
                setMessages(history as Message[])
            }
        }
        loadHistory()
        return () => { mounted = false }
    }, [selectedBotId, setMessages])

    const handleBotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBotId(e.target.value)
        setMessages([])
    }

    const handleResetConversation = async () => {
        if (!selectedBotId || isResetting) return
        if (!confirm("¿Estás seguro de que quieres borrar el historial de esta conversación de prueba?")) return
        setIsResetting(true)
        try {
            const result = await resetTestConversation(selectedBotId)
            if (result.success) {
                setMessages([])
                setHistoricalIds(new Set())
            }
        } finally {
            setIsResetting(false)
        }
    }

    if (bots.length === 0) return null

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="h-16 border-b border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 shadow-indigo-200 shadow-lg">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-800">Omni-Tester</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Virtualizer</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Platform Switcher */}
                    <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        {[
                            { id: 'web', icon: Globe, color: 'indigo-600' },
                            { id: 'whatsapp', icon: MessageCircle, color: '[#25D366]' },
                            { id: 'instagram', icon: InstagramIcon, color: 'fuchsia-500' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPlatform(p.id as Platform)}
                                aria-label={`Cambiar a ${p.id}`}
                                title={`Cambiar a ${p.id}`}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    platform === p.id
                                        ? (p.id === 'whatsapp' ? 'bg-[#25D366] text-white' : p.id === 'instagram' ? 'bg-fuchsia-100 text-fuchsia-600' : 'bg-indigo-600 text-white')
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <p.icon className="w-3.5 h-3.5" />
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
                        <Button variant="ghost" size="icon" aria-label="Limpiar Historial" title="Limpiar Historial" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={handleResetConversation} disabled={isResetting || messages.length === 0}>
                            {isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                        <select
                            aria-label="Seleccionar Bot"
                            title="Seleccionar Bot"
                            className="text-xs font-bold bg-white border border-slate-200 rounded-lg py-1.5 px-3 focus:ring-0 outline-none cursor-pointer"
                            value={selectedBotId}
                            onChange={handleBotChange}
                        >
                            {bots.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className={cn(
                "flex-1 overflow-y-auto p-6 relative transition-colors duration-500",
                platform === 'whatsapp' ? 'bg-[#efe7de]' : platform === 'instagram' ? 'bg-white' : 'bg-slate-50/50'
            )}>
                {platform === 'whatsapp' && (
                    <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />
                )}

                <div className="relative z-10 space-y-6">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300">
                            <Bot className="w-16 h-16 mb-4 opacity-10" />
                            <p className="font-bold text-sm uppercase tracking-tighter">Modo Virtualización: {platform}</p>
                        </div>
                    )}

                    {messages.map((m: Message) => (
                        <div key={m.id} className={cn("flex flex-col gap-2", m.role === 'user' ? 'items-end' : 'items-start')}>
                            {m.role === 'user' ? (
                                <div className="flex gap-3 justify-end w-full animate-in slide-in-from-right-2 duration-300">
                                    <div className="flex flex-col gap-1 items-end max-w-[85%]">
                                        <div className={cn(
                                            "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                            platform === 'whatsapp' ? "bg-[#dcf8c6] text-[#111b21] rounded-tr-sm shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] text-[14.2px]" :
                                                platform === 'instagram' ? "bg-[#3797f0] text-white rounded-[22px] px-4 py-2 text-[14px]" :
                                                    "bg-indigo-600 text-white rounded-tr-sm shadow-indigo-100 shadow-md"
                                        )}>
                                            <p className="whitespace-pre-wrap">{m.content}</p>
                                        </div>
                                        <ReadReceipt isHistorical={historicalIds.has(m.id)} platform={platform} />
                                    </div>
                                    {platform === 'web' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4 text-slate-600" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <DelayedBubble
                                    text={m.content.replace(/[*#]/g, '')}
                                    isFirst={true}
                                    isHistorical={historicalIds.has(m.id)}
                                    onVisible={scrollToBottom}
                                    onImageClick={setFullscreenImage}
                                    platform={platform}
                                />
                            )}
                        </div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <CognitiveTypingBubble onVisible={scrollToBottom} platform={platform} />
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 relative z-20">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium"
                        value={input}
                        placeholder={`Muestra un mensaje en ${platform}...`}
                        onChange={handleInputChange}
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        aria-label="Enviar Mensaje"
                        title="Enviar Mensaje"
                        disabled={isLoading || !input?.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 shadow-lg shadow-indigo-200"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>

            {/* Lightbox */}
            {fullscreenImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setFullscreenImage(null)}>
                    <button aria-label="Cerrar Imagen" title="Cerrar Imagen" onClick={() => setFullscreenImage(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                    <img src={fullscreenImage} alt="Zoom" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    )
}
