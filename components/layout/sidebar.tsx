"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, LayoutDashboard, Library, Settings2, Shapes } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Projets", href: "/projects", icon: FolderKanban },
  { label: "Templates", href: "/templates", icon: Shapes },
  { label: "Bibliothèque", href: "/library", icon: Library },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r md:flex md:flex-col bg-card/10">
      <nav className="flex-1 space-y-1 p-3" aria-label="Navigation principale">
        {navigation.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                isActive
                  ? "bg-violet-600/15 text-violet-400 border border-violet-500/25 shadow-[0_0_10px_rgba(139,92,246,0.05)]"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground border border-transparent",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
            pathname === "/settings"
              ? "bg-violet-600/15 text-violet-400 border border-violet-500/25 shadow-[0_0_10px_rgba(139,92,246,0.05)]"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground border border-transparent",
          )}
        >
          <Settings2 className="size-4" aria-hidden="true" />
          Paramètres
        </Link>
      </div>
    </aside>
  );
}

