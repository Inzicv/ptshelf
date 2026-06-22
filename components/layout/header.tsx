import { Layers3 } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-full max-w-[1600px] items-center px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Layers3 className="size-4" aria-hidden="true" />
          </span>
          <span className="font-semibold tracking-tight">PTShelf</span>
        </div>
        <div className="ml-auto rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          v0.1
        </div>
      </div>
    </header>
  );
}
