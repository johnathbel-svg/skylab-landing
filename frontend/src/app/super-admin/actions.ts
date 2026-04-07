"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"

// ============================================================================
// MASTER ACTIONS - PHASE 26: COMMAND CENTER EXPANSION
// These actions do not bypass RLS magically, but they execute from the context
// of an authenticated `super_admin` who has a global bypass policy in Supabase.
// ============================================================================

export async function suspendTenant(tenantId: string) {
    const supabase = await createClient()

    // We update the tenant status to 'canceled' to mimic a suspension
    const { error } = await supabase
        .from('tenants')
        .update({ subscription_status: 'canceled' })
        .eq('id', tenantId)

    if (error) {
        console.error("Master Control Error (Suspend):", error.message)
        return { success: false, error: "Operation failed. " + error.message }
    }

    // Revalidamos la ruta del super-admin para refrescar la UI
    revalidatePath('/super-admin')
    revalidatePath(`/super-admin/tenants/${tenantId}`)
    return { success: true }
}

export async function resumeTenant(tenantId: string) {
    const supabase = await createClient()

    // Revert back to active status
    const { error } = await supabase
        .from('tenants')
        .update({ subscription_status: 'active' })
        .eq('id', tenantId)

    if (error) {
        console.error("Master Control Error (Resume):", error.message)
        return { success: false, error: "Operation failed. " + error.message }
    }

    revalidatePath('/super-admin')
    revalidatePath(`/super-admin/tenants/${tenantId}`)
    return { success: true }
}

export async function forceUpdateSubscription(tenantId: string, formData: FormData) {
    const supabase = await createClient()
    const newPlan = formData.get('plan') as string

    if (!newPlan) return { success: false, error: "Invalid plan specified." }

    const { error } = await supabase
        .from('tenants')
        .update({ subscription_plan: newPlan })
        .eq('id', tenantId)

    if (error) {
        console.error("Master Control Error (Update Plan):", error.message)
        return { success: false, error: "Operation failed. " + error.message }
    }

    revalidatePath('/super-admin')
    revalidatePath(`/super-admin/tenants/${tenantId}`)
    return { success: true }
}
