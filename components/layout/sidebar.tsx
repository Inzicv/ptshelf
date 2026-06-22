import Link from "next/link";
import { FolderKanban, LayoutDashboard, Library, Settings2, Shapes } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, current: true },
  { label: "Projets", href: "#", icon: FolderKanban, current: false },
  { label: "Templates", href: "#", icon: Shapes, current: false },
  { label: "Bibliothèque", href: "#", icon: Library, current: false },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r md:flex md:flex-col">
      <nav className="flex-1 space-y-1 p-3" aria-label="Navigation principale">
        {navigation.map(({ label, href, icon: Icon, current }) => (
          <Link
            key={label}
            href={href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              current
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
          <Settings2 className="size-4" aria-hidden="true" />
          Paramètres
        </div>
      </div>
    </aside>
  );
}
