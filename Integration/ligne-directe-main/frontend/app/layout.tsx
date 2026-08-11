import type { Metadata } from "next";
import { Manrope, Inter, IBM_Plex_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const heading = Manrope({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-heading" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Devis — 3LM Solutions",
  description: "Générateur de devis assisté par IA",
};

// Ce layout ne s'applique qu'aux routes sous /devis (App Router) —
// il n'affecte pas les pages existantes sous pages/ (Pages Router).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${heading.variable} ${body.variable} ${mono.variable} devis-scope`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-[var(--paper)] min-h-screen flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
