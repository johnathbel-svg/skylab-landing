'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getCrmContactsAction, 
    updateLeadStageAction, 
    toggleHandoffAction, 
    getConversationHistoryAction 
} from './actions';
import { createClient } from '@/utils/supabase/client';
import { Loader2, MessageSquare, Phone, Mail, User, ShieldAlert, X, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Tipos
type LeadStage = 'new' | 'qualified' | 'proposal' | 'won' | 'lost';

interface CrmContact {
    id: string;
    name: string;
    contactInfo: string;
    channel: string;
    leadStage: LeadStage;
    createdAt: string;
    conversationId: string | null;
    humanInControl: boolean;
    lastMessage: string;
}

const STAGES: { id: LeadStage; label: string; color: string }[] = [
    { id: 'new', label: 'Nuevos', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    { id: 'qualified', label: 'Calificados', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
    { id: 'proposal', label: 'Negociación', color: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
    { id: 'won', label: 'Ganados', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' },
    { id: 'lost', label: 'Perdidos', color: 'bg-red-500/20 text-red-400 border-red-500/50' },
];

export default function CrmPage() {
    const [contacts, setContacts] = useState<CrmContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState<CrmContact | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchContacts = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch tenant id
            const { data: role } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).single();
            if (!role?.tenant_id) return;

            const res = await getCrmContactsAction(role.tenant_id);
            // Cast to LeadStage intentionally
            setContacts(res as any);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // Funciones Drag & Drop nativas
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedContactId(id);
        e.dataTransfer.effectAllowed = 'move';
        // Hack visual para ocultar fantasma original (opcional)
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, stageId: LeadStage) => {
        e.preventDefault();
        if (!draggedContactId) return;

        // Optimistic UI update
        const draggedContact = contacts.find(c => c.id === draggedContactId);
        if (draggedContact && draggedContact.leadStage !== stageId) {
            setContacts(prev => prev.map(c => c.id === draggedContactId ? { ...c, leadStage: stageId } : c));
            
            const req = await updateLeadStageAction(draggedContactId, stageId);
            if (!req.success) {
                // Rollback si falla
                toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
                fetchContacts();
            } else {
                toast({ title: "Lead Actualizado", description: `Movido a ${STAGES.find(s => s.id === stageId)?.label}` });
            }
        }
        setDraggedContactId(null);
    };

    // Funciones Panel Lateral
    const openContactPanel = async (contact: CrmContact) => {
        setSelectedContact(contact);
        setLoadingHistory(true);
        if (contact.conversationId) {
            const msgs = await getConversationHistoryAction(contact.conversationId);
            setHistory(msgs);
        } else {
            setHistory([]);
        }
        setLoadingHistory(false);
    };

    const handleHandoffToggle = async () => {
        if (!selectedContact || !selectedContact.conversationId) return;
        
        const req = await toggleHandoffAction(selectedContact.conversationId, selectedContact.humanInControl);
        if (req.success) {
            const newFlag = req.newStatus;
            setSelectedContact({ ...selectedContact, humanInControl: newFlag });
            // Update in main list
            setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, humanInControl: newFlag } : c));
            
            toast({
                title: newFlag ? "Control Manual Activado" : "Control IA Activado",
                description: newFlag 
                    ? "El bot ya no responderá a este lead. Puedes hablar ahora." 
                    : "El bot ahora responderá automáticamente de nuevo.",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex w-full items-center justify-center p-20 h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-[#9FA8FF]" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] w-full overflow-hidden bg-[#0A0B14]">
            {/* Tablero Kanban */}
            <div className="flex flex-1 overflow-x-auto p-6 space-x-6 hide-scrollbar relative z-10">
                {STAGES.map((stage) => (
                    <div 
                        key={stage.id} 
                        className="flex-shrink-0 w-80 flex flex-col h-full bg-[#111322]/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <span className="font-semibold text-white/90 text-sm tracking-wide">{stage.label}</span>
                            <span className={\`text-xs px-2 py-0.5 rounded-full border \${stage.color}\`}>
                                {contacts.filter(c => c.leadStage === stage.id).length}
                            </span>
                        </div>
                        
                        <div className="flex-1 p-3 overflow-y-auto space-y-3 pretty-scrollbar">
                            <AnimatePresence>
                                {contacts.filter(c => c.leadStage === stage.id).map(contact => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={contact.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e as any, contact.id)}
                                        onClick={() => openContactPanel(contact)}
                                        className={\`p-4 rounded-xl cursor-grab active:cursor-grabbing border hover:border-[#9FA8FF]/50 transition-all duration-200 \${draggedContactId === contact.id ? 'opacity-50 scale-95 border-dashed border-[#9FA8FF]' : 'bg-[#1A1C2E] border-white/10 shadow-lg'}\`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="font-medium text-white/90 truncate mr-2 flex items-center">
                                                <User className="w-3.5 h-3.5 mr-2 text-white/40" />
                                                {contact.name}
                                            </div>
                                            {contact.humanInControl && (
                                                <ShieldAlert className="w-4 h-4 text-orange-400" />
                                            )}
                                        </div>
                                        <div className="text-xs text-white/50 mb-3 flex flex-col gap-1">
                                            <span className="flex items-center"><Phone className="w-3 h-3 justify-center mr-1" />{contact.contactInfo}</span>
                                        </div>
                                        <div className="text-[11px] text-[#9FA8FF]/70 truncate bg-[#9FA8FF]/10 p-2 rounded-lg border border-[#9FA8FF]/10 line-clamp-2 white-space-normal">
                                            <MessageSquare className="w-3 h-3 inline mr-1 opacity-50" />
                                            {contact.lastMessage}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Lateral / Overly unificado */}
            <AnimatePresence>
                {selectedContact && (
                    <motion.div 
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-96 h-full bg-[#111322] border-l border-white/10 shadow-2xl flex flex-col absolute right-0 z-50"
                    >
                        {/* Header Panel */}
                        <div className="p-5 border-b border-white/10 flex justify-between items-start bg-gradient-to-b from-white/5 to-transparent">
                            <div>
                                <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                                    {selectedContact.name}
                                </h3>
                                <div className="text-sm text-white/50 mt-1 flex gap-3">
                                    <span>{selectedContact.channel}</span>
                                    <span>•</span>
                                    <span>{selectedContact.contactInfo}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedContact(null)} className="p-2 hover:bg-white/10 rounded-full transition text-white/50 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Control Handoff */}
                        <div className="p-4 border-b border-white/5">
                            <button 
                                onClick={handleHandoffToggle}
                                className={\`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors \${selectedContact.humanInControl ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 hover:bg-orange-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'}\`}
                            >
                                <ShieldAlert className="w-4 h-4" />
                                {selectedContact.humanInControl ? "Control Maestro Activo" : "Tomar Control Manual"}
                            </button>
                            <p className="text-[10px] text-center mt-2 text-white/40">
                                {selectedContact.humanInControl ? "El bot está PAUSADO. Responde desde este panel." : "El bot responderá automáticamente usando IA."}
                            </p>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 pretty-scrollbar bg-[#0A0B14]/50">
                            {loadingHistory ? (
                                <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-[#9FA8FF]" /></div>
                            ) : history.length === 0 ? (
                                <div className="text-center text-white/30 text-sm mt-10">No hay mensajes.</div>
                            ) : (
                                history.map((msg, i) => (
                                    <div key={i} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                                        <div className={\`max-w-[85%] rounded-2xl p-3 text-sm shadow-md \${msg.role === 'user' ? 'bg-[#9FA8FF] text-[#0A0B14] rounded-br-[4px]' : 'bg-[#1A1C2E] border border-white/10 text-white/90 rounded-bl-[4px]'}\`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input (Dummy for now) */}
                        {selectedContact.humanInControl && (
                            <div className="p-4 border-t border-white/10 bg-[#111322]">
                                <div className="flex relative">
                                    <input 
                                        type="text" 
                                        placeholder="Escribe un mensaje directo..." 
                                        className="w-full bg-[#1A1C2E] border border-white/10 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-[#9FA8FF]/50" 
                                    />
                                    <button className="absolute right-2 top-2 p-1.5 bg-[#9FA8FF] text-[#0A0B14] rounded-lg">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Backdrop cuando el panel está abierto */}
            <AnimatePresence>
                {selectedContact && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedContact(null)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
