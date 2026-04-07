-- Migration: 20260308001000_add_messages_delete_policy
-- Description: Añade la política RLS que permite a los usuarios borrar los mensajes de sus bots (para poder resetear la conversación)

CREATE POLICY "Messages can be deleted by tenant members"
ON public.messages FOR DELETE
USING (tenant_id IN (SELECT public.get_current_user_tenant_ids()));
