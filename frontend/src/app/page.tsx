"use client";

import { motion } from "framer-motion";
import { SkylabLogo, SkylabBrandText } from "@/components/layout/SkylabLogo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center max-w-3xl"
      >
        <div className="flex justify-center mb-10">
          <SkylabLogo size={160} />
        </div>
        <h1 className="flex flex-col items-center justify-center text-center mb-6">
          <SkylabBrandText className="font-black text-[5rem] md:text-[8rem] mb-2 leading-none" />
          <span className="text-2xl md:text-3xl text-[#0EA5E9]/80 font-bold tracking-[0.3em] uppercase mt-2">
            Human Bot
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
          La evolución de la comunicación IA. Humanización profunda, motor RAG nativo y un flujo de trabajo omnicanal bajo el sello Skylab.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
          >
            Comenzar Prueba Gratis
          </motion.button>

          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-full shadow-sm hover:bg-secondary/80 transition-colors uppercase tracking-widest text-xs"
            >
              Ver Dashboard
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Glassmorphism Card Element Demo */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="mt-20 z-10 w-full max-w-4xl p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-xs text-muted-foreground font-black tracking-widest uppercase">Skylab Human Interface Preview</div>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          [ CRM Unified Inbox Interface ]
        </div>
      </motion.div>
    </div>
  );
}
