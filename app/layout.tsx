import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { LibraryProvider } from "@/context/LibraryContext";
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
        <LibraryProvider>
          <AppShell>{children}</AppShell>
        </LibraryProvider>
      </body>
    </html>
  );
}

