import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PTShelf",
    template: "%s · PTShelf",
  },
  description: "Organisez et réutilisez vos prompts, variables et presets.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
