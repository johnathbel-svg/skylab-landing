"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, LayoutDashboard, MessageSquareText, Users, LogOut, ChevronRight, FlaskConical, Database, Network, Sparkles, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SkylabLogo, SkylabBrandText } from "./SkylabLogo"
import { signout } from "@/app/auth/actions"

interface SidebarProps {
    userEmail: string
}

export function Sidebar({ userEmail }: SidebarProps) {
    const pathname = usePathname()

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            color: "text-blue-500",
        },
        {
            label: "Bot Builder 🤖",
            icon: Sparkles,
            href: "/dashboard/bot-builder",
            color: "text-blue-400",
        },
        {
            label: "Configuración Inicial",
            icon: Palette,
            href: "/dashboard/onboarding",
            color: "text-amber-400",
        },
        {
            label: "Conversaciones",
            icon: MessageSquareText,
            href: "/dashboard/conversations",
            color: "text-blue-500",
        },
        {
            label: "Bot Tester (Gemini)",
            icon: FlaskConical,
            href: "/dashboard/bot-tester",
            color: "text-purple-500",
        },
        {
            label: "CRM Componentes",
            icon: Users,
            href: "/dashboard/crm",
            color: "text-blue-500",
        },
        {
            label: "Base de Conocimiento",
            icon: Database,
            href: "/dashboard/knowledge",
            color: "text-slate-500",
        },
        {
            label: "Integraciones",
            icon: Network,
            href: "/dashboard/integrations",
            color: "text-emerald-500",
        },
    ]

    return (
        <aside className="relative flex flex-col w-64 h-full bg-[#1e1e2d] border-r border-slate-800/40 font-sans shadow-xl">
            {/* Brand Header */}
            <div className="flex items-center h-24 px-6 mt-2 relative z-10 border-b border-white/[0.04]">
                <SkylabLogo size={48} className="mr-3" />
                <SkylabBrandText className="font-black text-3xl tracking-tighter mb-0.5" />
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 py-8 space-y-2 relative z-10 overflow-y-auto">
                <div className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Menú Principal
                </div>

                <div className="px-3 space-y-1">
                    {routes.map((route) => {
                        const isActive = pathname === route.href

                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "relative flex items-center justify-between px-3 py-3 text-[13px] font-semibold transition-all rounded-xl group",
                                    isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                                )}
                            >
                                {/* Active Background Animation */}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-600/20"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <div className="flex items-center relative z-10">
                                    <route.icon className={cn("w-[18px] h-[18px] mr-3", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400 transition-colors")} />
                                    <span>{route.label}</span>
                                </div>

                                {isActive && (
                                    <ChevronRight className="w-4 h-4 text-white relative z-10 opacity-70" />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Footer User Area */}
            <div className="p-4 relative z-10 mt-auto border-t border-white/[0.04]">
                <div className="rounded-xl bg-black/20 p-3 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-sm font-bold text-blue-400">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-white leading-tight truncate w-32">{userEmail}</span>
                            <span className="text-[11px] text-slate-500 font-medium">Owner</span>
                        </div>
                    </div>

                    <form action={signout} className="w-full">
                        <Button
                            type="submit"
                            variant="ghost"
                            className="w-full justify-start text-[13px] text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-lg h-9 px-2"
                        >
                            <LogOut className="w-[14px] h-[14px] mr-2" />
                            Cerrar Sesión
                        </Button>
                    </form>
                </div>
            </div>
        </aside>
    )
}
