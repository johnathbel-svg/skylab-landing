import { ReactNode } from 'react'
import { Crown, Database, Activity, ShieldAlert, LogOut } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
    title: 'Skylab Command Center',
    description: 'Super Admin Dashboard for Skylab Human Bot',
}

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient()

    // Doble validación de seguridad (Server-Side)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: superAdmin } = await supabase
        .from('super_admins')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!superAdmin) {
        redirect('/dashboard')
    }

    return (
        <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
            {/* Super Admin Vertical Navigation */}
            <aside className="w-72 border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-2xl p-6 flex flex-col relative z-20 shadow-2xl">
                <div className="flex items-center gap-4 mb-12">
                    <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30">
                        <Crown className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight text-white mb-0.5">Skylab</h1>
                        <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Command Center</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/super-admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 transition-all shadow-sm">
                        <Database className="w-5 h-5" />
                        <span className="text-sm font-semibold">Tenants & Bots</span>
                    </Link>
                    <Link href="/super-admin/metrics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors">
                        <Activity className="w-5 h-5" />
                        <span className="text-sm font-medium">System Metrics</span>
                    </Link>
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-800/60">
                    <form action="/auth/signout" method="POST" className="w-full">
                        <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors group">
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Sign Out</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Content Area with Pattern Overlay */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 w-full bg-[#050B14]">
                {/* Subtle Grid Pattern for "Dev/Admin" feel */}
                {/* eslint-disable-next-line react-inline-style/no-inline-styles */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                <div className="relative z-10 max-w-7xl mx-auto w-full p-8 md:p-12">
                    {children}
                </div>
            </main>
        </div>
    )
}
