'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveOnboardingAction(formData: any) {
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout al guardar la configuración (10s)")), 10000)
        );

        const executionPromise = async () => {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No sesión activa');

            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('tenant_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (roleError) throw roleError;
            if (!roleData) throw new Error('Usuario no vinculado a ningún Tenant');

            const tenantId = roleData.tenant_id;

            // 1. Update Tenant
            const { error: tenantError } = await supabase
                .from('tenants')
                .update({
                    name: formData.businessName,
                    industry: formData.industry,
                    estimated_monthly_sales: parseInt(formData.monthlySales) || 0,
                    estimated_interactions: parseInt(formData.interactions) || 0,
                    subscription_plan: formData.suggestedPlan || 'starter'
                })
                .eq('id', tenantId);

            if (tenantError) throw tenantError;

            // 2. Generate dynamic system prompt if templateId is provided
            let systemPrompt = `Eres un asistente servicial para ${formData.businessName}.`;
            
            if (formData.templateId) {
                const { data: template } = await supabase
                    .from('bot_templates')
                    .select('base_system_prompt')
                    .eq('id', formData.templateId)
                    .single();
                    
                if (template) {
                    systemPrompt = `${template.base_system_prompt}\n\nContexto del cliente:\n- Empresa: ${formData.businessName}\n`;
                    if (formData.answers && Object.keys(formData.answers).length > 0) {
                        systemPrompt += `- Configuraciones extra: ${JSON.stringify(formData.answers, null, 2)}`;
                    }
                }
            }

            // 3. Update/Create Bot
            const { data: bots } = await supabase
                .from('bots')
                .select('id')
                .eq('tenant_id', tenantId)
                .limit(1);

            if (bots && bots.length > 0) {
                const { error: botError } = await supabase
                    .from('bots')
                    .update({
                        name: formData.botName,
                        tone_style: formData.tone,
                        use_emojis: formData.useEmojis || 'high',
                        specialized_industry: formData.industry,
                        system_prompt: systemPrompt
                    })
                    .eq('id', bots[0].id);
                if (botError) throw botError;
            } else {
                const { error: botError } = await supabase
                    .from('bots')
                    .insert({
                        tenant_id: tenantId,
                        name: formData.botName,
                        tone_style: formData.tone,
                        use_emojis: formData.useEmojis || 'high',
                        specialized_industry: formData.industry,
                        system_prompt: systemPrompt
                    });
                if (botError) throw botError;
            }

            return { success: true };
        };

        const result = await Promise.race([executionPromise(), timeoutPromise]);
        
        // Removed revalidatePath('/dashboard') logic which was blocking in edge cases.
        // We will do a router.refresh() on the client side if needed.
        
        return result;

    } catch (error: any) {
        console.error('Onboarding Error:', error);
        return { success: false, error: error.message || 'Error al guardar configuración' };
    }
}

export async function getTemplatesAction() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('bot_templates')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error('Error fetching templates:', error);
        return { success: false, data: [] };
    }
}
