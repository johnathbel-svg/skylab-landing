import { Outfit, Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from 'sonner';
import "./globals.css";

/* Fuente principal de cuerpo — Outfit (Synerg-IA brand) */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

/* Fuente display — Space Grotesk (Skylab accent) */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Skylab Human Bot | by Synerg-IA",
  description: "La plataforma de chatbots más humana del mercado hispano. Automatización inteligente con el sello de Synerg-IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: '#131929',
              border: '1px solid rgba(72,202,228,0.15)',
              color: '#F5F7F9',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
