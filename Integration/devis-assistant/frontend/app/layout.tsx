// layout.tsx
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devis — Assistant IA",
  description: "Générateur de devis assisté par IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-[var(--paper)] min-h-screen flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
