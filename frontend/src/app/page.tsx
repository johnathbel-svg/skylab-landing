"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Database,
  LockKeyhole,
  MessageSquareText,
  Network,
  Sparkles,
} from "lucide-react"

const metrics = [
  { label: "Conversaciones", value: "2,340", trend: "+18.5%", icon: MessageSquareText },
  { label: "Satisfaccion", value: "96%", trend: "Excelente", icon: CheckCircle2 },
  { label: "Mensajes", value: "18.4k", trend: "+21.3%", icon: BarChart3 },
]

const flows = [
  { label: "Soporte", detail: "Guia al cliente", active: true },
  { label: "Ventas", detail: "Califica leads", active: true },
  { label: "Reservas", detail: "Agenda citas", active: false },
]

const capabilities = [
  { label: "Chatbots humanizados", icon: Bot },
  { label: "RAG nativo", icon: Database },
  { label: "Omnicanal", icon: Network },
  { label: "Seguridad", icon: LockKeyhole },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070B12] text-white selection:bg-[#00B4DB]/25 lg:h-screen lg:overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.55) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(0,180,219,.14), transparent 30%, transparent 70%, rgba(11,28,50,.72))",
          }}
        />
        <div
          className="absolute left-[-180px] top-[-160px] h-[520px] w-[520px] rounded-full opacity-18 blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(0,180,219,.28), transparent 68%)" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 py-5 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between">
          <Image
            src="/brand/synergia-wordmark-transparent.png"
            alt="Synerg-IA Automation"
            width={204}
            height={108}
            priority
            className="h-auto w-[104px] object-contain opacity-50 mix-blend-screen"
          />
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-bold text-[#9AA7B8] transition-colors hover:text-white sm:block"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#00B4DB] px-4 text-sm font-black text-[#061018] shadow-[0_16px_42px_rgba(0,180,219,.2)] transition-colors hover:bg-[#26C7EA]"
            >
              Acceder
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[.94fr_1.06fr] lg:py-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="mb-8">
              <Image
                src="/brand/skylab-horizontal-transparent.png"
                alt="Skylab Human Bot"
                width={355}
                height={125}
                priority
                className="h-auto w-[330px] object-contain drop-shadow-[0_16px_34px_rgba(0,0,0,.42)] mix-blend-screen sm:w-[390px]"
              />
            </div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00B4DB]/20 bg-[#00B4DB]/8 px-3 py-1.5 text-xs font-bold uppercase text-[#9BEAFF] shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma inteligente para equipos comerciales
            </div>

            <h1
              className="max-w-[720px] text-[clamp(3rem,5vw,5.1rem)] font-semibold leading-[1.02] text-white"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Automatiza conversaciones sin perder el toque humano.
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-7 text-[#A6B3C4]">
              Crea asistentes humanizados, conecta conocimiento de negocio y opera conversaciones omnicanal desde un dashboard profesional.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#00B4DB] px-6 text-sm font-black text-[#061018] shadow-[0_18px_48px_rgba(0,180,219,.22)] transition-colors hover:bg-[#26C7EA]"
              >
                Entrar a Skylab
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-[#0B0F17] px-6 text-sm font-bold text-[#D8E1EA] transition-colors hover:bg-white/[0.07]"
              >
                Ver dashboard
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {capabilities.map((capability) => (
                <div key={capability.label} className="flex items-center gap-2 text-sm font-semibold text-[#A6B3C4]">
                  <capability.icon className="h-4 w-4 text-[#00B4DB]" />
                  {capability.label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
            className="relative"
          >
            <div
              className="absolute inset-8 rounded-full opacity-18 blur-[110px]"
              style={{ background: "radial-gradient(circle, rgba(0,180,219,.42), transparent 68%)" }}
            />
            <div className="relative rounded-lg bg-gradient-to-br from-white/16 via-white/5 to-[#00B4DB]/12 p-px shadow-[0_24px_90px_rgba(0,0,0,.42)]">
              <div className="rounded-lg bg-[#0B0F17]/94 p-4 backdrop-blur-xl sm:p-5">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[11px] font-black uppercase text-[#7E8A9C]" style={{ letterSpacing: ".18em" }}>
                    Skylab Human Interface
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_.78fr]">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {metrics.map((metric) => (
                        <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                          <div className="mb-3 flex items-center justify-between">
                            <metric.icon className="h-4 w-4 text-[#00B4DB]" />
                            <span className="text-[10px] font-bold text-emerald-300">{metric.trend}</span>
                          </div>
                          <div className="text-2xl font-bold">{metric.value}</div>
                          <div className="mt-1 text-[11px] font-semibold text-[#7E8A9C]">{metric.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#0B0F17] p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">Actividad reciente</div>
                          <div className="text-xs font-medium text-[#7E8A9C]">Interacciones de los ultimos 7 dias</div>
                        </div>
                        <div className="rounded-full border border-[#00B4DB]/20 bg-[#00B4DB]/8 px-3 py-1 text-xs font-bold text-[#9BEAFF]">
                          En vivo
                        </div>
                      </div>
                      <div className="flex h-48 items-end gap-2">
                        {[38, 58, 46, 68, 52, 74, 92].map((height, index) => (
                          <div key={index} className="flex flex-1 flex-col items-center gap-2">
                            <div
                              className="w-full rounded-t bg-gradient-to-t from-[#00B4DB] to-[#77E6FF]"
                              style={{ height: `${height}%` }}
                            />
                            <span className="text-[10px] font-bold text-[#647086]">{index + 12}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-white/10 bg-[#0B0F17] p-4">
                      <div className="mb-4 text-sm font-bold">Constructor de flujo</div>
                      <div className="space-y-3">
                        {flows.map((flow) => (
                          <div
                            key={flow.label}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-[#070B12]/70 p-3"
                          >
                            <div>
                              <div className="text-sm font-bold text-white">{flow.label}</div>
                              <div className="text-xs font-medium text-[#7E8A9C]">{flow.detail}</div>
                            </div>
                            <span className={`h-2 w-2 rounded-full ${flow.active ? "bg-emerald-300" : "bg-[#5E6A7D]"}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#0B0F17] p-4">
                      <div className="mb-4 flex items-center gap-3">
                        <Image
                          src="/brand/skylab-app-icon-original.png"
                          alt="Skylab"
                          width={188}
                          height={162}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="text-sm font-bold">Asistente virtual</div>
                          <div className="text-xs font-medium text-emerald-300">En linea</div>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="max-w-[86%] rounded-lg bg-white/[0.07] p-3 text-[#D8E1EA]">
                          Hola, soy tu asistente virtual. Como puedo ayudarte hoy?
                        </div>
                        <div className="ml-auto max-w-[86%] rounded-lg bg-[#00B4DB] p-3 font-semibold text-[#061018]">
                          Necesito informacion sobre sus servicios.
                        </div>
                        <div className="max-w-[86%] rounded-lg bg-white/[0.07] p-3 text-[#D8E1EA]">
                          Claro. Te puedo guiar por soporte, ventas o reservas.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  )
}
