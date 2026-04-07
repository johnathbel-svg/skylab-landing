/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function seedDemoData() {
    const supabase = await createClient()

    // 1. Validar Autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'No autorizado. Por favor inicia sesión.' }
    }

    // 2. Obtener el Tenant del usuario
    const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single()

    if (roleError || !roleData?.tenant_id) {
        return { error: 'No se encontró una empresa asociada a tu cuenta.' }
    }

    const tenantId = roleData.tenant_id

    try {
        // 3. Crear 2 Bots RAG de prueba
        const { data: bots, error: botsError } = await supabase
            .from('bots')
            .insert([
                { tenant_id: tenantId, name: 'Soporte Técnico B2B', system_prompt: 'Eres un bot especializado en resolver problemas técnicos de la plataforma BotFlow.' },
                { tenant_id: tenantId, name: 'Calificador de Leads V2', system_prompt: 'Eres un cerrador de ventas implacable, tu objetivo es recolectar el presupuesto del cliente.' }
            ])
            .select()

        if (botsError || !bots) throw new Error('Error generando Bots de prueba.')

        // 4. Mocks: 10 Contactos corporativos realistas colombianos
        const mockContacts = [
            { tenant_id: tenantId, name: 'Alejandro Restrepo', email: 'alejandro@innovatech.co', phone_number: '+57 320 123 4567', channel: 'whatsapp' },
            { tenant_id: tenantId, name: 'Valentina Osorio', email: 'vosorio@constructora-andina.com', phone_number: '+57 311 987 6543', channel: 'web' },
            { tenant_id: tenantId, name: 'Santiago Mejía', email: 'santiago.m@logistica-global.co', phone_number: '+57 300 456 7890', channel: 'telegram' },
            { tenant_id: tenantId, name: 'Camila Ríos', email: 'c.rios@finanzas-seguras.com.co', phone_number: '+57 315 111 2233', channel: 'whatsapp' },
            { tenant_id: tenantId, name: 'Juan Pablo Gaviria', email: 'juan.gaviria@agrobusiness.co', phone_number: '+57 312 333 4455', channel: 'instagram' },
            { tenant_id: tenantId, name: 'Isabella Vélez', email: 'isabella@saludtech.co', phone_number: '+57 318 666 7788', channel: 'web' },
            { tenant_id: tenantId, name: 'Mateo Londoño', email: 'mlondono@retail-latam.co', phone_number: '+57 301 999 8877', channel: 'whatsapp' },
            { tenant_id: tenantId, name: 'Daniela Salazar', email: 'daniela.salazar@educacion-futuro.com', phone_number: '+57 310 555 1234', channel: 'telegram' },
            { tenant_id: tenantId, name: 'Simón Jaramillo', email: 's.jaramillo@desarrollo-inmobiliario.co', phone_number: '+57 313 777 9900', channel: 'whatsapp' },
            { tenant_id: tenantId, name: 'Sofía Castaño', email: 'sofia.castano@marketing-pro.co', phone_number: '+57 321 444 5566', channel: 'instagram' }
        ]

        const { data: contacts, error: contactsError } = await supabase
            .from('contacts')
            .insert(mockContacts)
            .select()

        if (contactsError || !contacts) throw new Error('Error generando Leads de prueba.')

        // 5. Mocks: 10 Conversaciones (Vinculando Contacts + Bots)
        const mockConversations = contacts.map((c, index) => {
            // Asigna bots alternadamente y estados de manera aleatoria
            const botAssignedId = index % 2 === 0 ? bots[0].id : bots[1].id;
            const statusCycle = ['open', 'open', 'closed', 'handoff'];

            return {
                tenant_id: tenantId,
                contact_id: c.id,
                bot_id: botAssignedId,
                channel: c.channel,
                status: statusCycle[index % 4],
                created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString() // Fechas pasadas aleatorias para dar realismo a las tablas
            }
        })

        const { error: conversationsError } = await supabase
            .from('conversations')
            .insert(mockConversations)

        if (conversationsError) throw new Error('Error al vincular conversaciones de prueba.')

        // Forzar la recarga de las pantallas afectadas para mostrar la tabla renderizada
        revalidatePath('/dashboard')
        revalidatePath('/dashboard/crm')
        revalidatePath('/dashboard/conversations')

        return { success: true }

    } catch (error: any) {
        return { error: error.message || 'Error desconocido poblando la Base de Datos.' }
    }
}
