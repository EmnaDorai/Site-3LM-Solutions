// layout.tsx
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devis — Assistant IA",
  description: "Générateur de devis assisté par IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
