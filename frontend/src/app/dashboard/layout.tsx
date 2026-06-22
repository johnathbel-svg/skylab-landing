import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from 'sonner'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Consultamos si el usuario ya cuenta con un tenant asignado o está impersonado
    const { getActiveTenantId } = await import('@/utils/supabase/server')
    const tenantId = await getActiveTenantId()
    const hasTenant = !!tenantId

    // Check impersonation cookies
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const isImpersonating = !!cookieStore.get('impersonate_tenant_id')?.value
    let isSuperAdmin = false
    if (isImpersonating) {
        const { data: superAdmin } = await supabase
            .from('super_admins')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()
        isSuperAdmin = !!superAdmin
    }

    return (
        <div className="flex h-screen bg-[#070B12] text-white overflow-hidden font-sans">

            {/* Clean Dark Sidebar */}
            <div className="z-20 h-full border-r border-white/10 bg-[#0B0F17] flex-shrink-0">
                <Sidebar userEmail={user.email || 'Admin'} hasTenant={hasTenant} />
            </div>

            {/* Main Dark Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full bg-[#070B12]">
                {isImpersonating && isSuperAdmin && (
                    <div className="bg-gradient-to-r from-indigo-900/90 to-slate-900/90 border-b border-indigo-500/30 px-6 py-3 flex items-center justify-between backdrop-blur-xl animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-3">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider">
                                Impersonating Mode Active
                            </p>
                            <span className="text-xs text-slate-400 font-medium">
                                Viewing dashboard as Tenant ID: <span className="font-mono text-slate-350 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">{tenantId}</span>
                            </span>
                        </div>
                        <form action={async () => {
                            "use server"
                            const { stopImpersonation } = await import('@/app/super-admin/actions')
                            await stopImpersonation()
                        }}>
                            <button
                                type="submit"
                                className="px-3 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-lg transition-all cursor-pointer"
                            >
                                Stop Impersonation
                            </button>
                        </form>
                    </div>
                )}
                {children}
            </main>

            {/* Global Toaster for Tenant Modules */}
            <Toaster theme="dark" position="bottom-right" className="font-sans" />
        </div>
    )
}
