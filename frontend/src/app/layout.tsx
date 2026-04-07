import { Montserrat, Open_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skylab Human Bot | Inteligencia Artificial Biomimética",
  description: "La plataforma de bots más humana del mercado. Automatización con sello Skylab.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${openSans.variable} ${montserrat.variable} font-sans antialiased text-slate-800 bg-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
