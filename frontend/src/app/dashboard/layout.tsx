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

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

            {/* Dark Premium Sidebar */}
            <div className="z-20 h-full shadow-2xl">
                <Sidebar userEmail={user.email || 'Admin'} />
            </div>

            {/* Main Light Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full bg-slate-50">
                {children}
            </main>

            {/* Global Toaster for Tenant Modules */}
            <Toaster theme="dark" position="bottom-right" className="font-sans" />
        </div>
    )
}
