'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Fetch Contacts with their open conversations and latest message snippet
export async function getCrmContactsAction(tenantId: string) {
    const supabase = await createClient();

    // 1. Get contacts
    const { data: contacts, error } = await supabase
        .from('contacts')
        .select(`
            id, name, phone_number, email, channel, lead_stage, created_at,
            conversations ( id, status, human_in_control, messages ( role, content, created_at ) )
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching CRM contacts:", error);
        return [];
    }

    // Map the shape for the frontend
    const mappedContacts = contacts.map(c => {
        // Find the open conversation
        const cConversations = Array.isArray(c.conversations) ? c.conversations : [];
        const openConv = cConversations.find(conv => conv.status === 'open') || cConversations[0];
        
        // Find the last message
        let lastMessage = null;
        if (openConv && openConv.messages && Array.isArray(openConv.messages) && openConv.messages.length > 0) {
            // Sort to get the most recent
            const sortedMsgs = openConv.messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            lastMessage = sortedMsgs[0].content;
        }

        return {
            id: c.id,
            name: c.name || c.phone_number || 'Cliente Anónimo',
            contactInfo: c.phone_number || c.email || 'Sin datos',
            channel: c.channel,
            leadStage: c.lead_stage || 'new',
            createdAt: c.created_at,
            conversationId: openConv?.id || null,
            humanInControl: openConv?.human_in_control || false,
            lastMessage: lastMessage || 'Sin mensajes aún...'
        };
    });

    return mappedContacts;
}

// Update Lead Stage
export async function updateLeadStageAction(contactId: string, newStage: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('contacts')
        .update({ lead_stage: newStage })
        .eq('id', contactId);

    if (error) {
        return { success: false, error: error.message };
    }
    
    revalidatePath('/dashboard/crm');
    return { success: true };
}

// Toggle Human Handoff
export async function toggleHandoffAction(conversationId: string, currentFlag: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('conversations')
        .update({ human_in_control: !currentFlag })
        .eq('id', conversationId);

    if (error) {
        return { success: false, error: error.message };
    }
    
    revalidatePath('/dashboard/crm');
    return { success: true, newStatus: !currentFlag };
}

// Get Conversation History
export async function getConversationHistoryAction(conversationId: string) {
    const supabase = await createClient();

    const { data: messages, error } = await supabase
        .from('messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching history:", error);
        return [];
    }

    return messages;
}
