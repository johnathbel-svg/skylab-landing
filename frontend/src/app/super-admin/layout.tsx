import { ReactNode } from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar"

export const metadata = {
    title: "Skylab Command Center",
    description: "Super Admin Dashboard for Skylab Human Bot",
}

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient()

    // Doble validación de seguridad (Server-Side)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login")
    }

    const { data: superAdmin } = await supabase
        .from("super_admins")
        .select("*")
        .eq("user_id", user.id)
        .single()

    if (!superAdmin) {
        redirect("/dashboard")
    }

    return (
        <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
            {/* Super Admin Vertical Navigation */}
            <SuperAdminSidebar userEmail={user.email || "super-admin@skylab.com"} />

            {/* Content Area with Pattern Overlay */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 w-full bg-[#050B14]">
                {/* Subtle Grid Pattern for "Dev/Admin" feel */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

                <div className="relative z-10 max-w-7xl mx-auto w-full p-8 md:p-12">
                    {children}
                </div>
            </main>
        </div>
    )
}