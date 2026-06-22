import { LibraryBig } from "lucide-react";

export default function DashboardPage() {
  return (
    <section className="flex min-h-full flex-col">
      <div className="border-b px-5 py-6 sm:px-8">
        <p className="text-sm text-muted-foreground">Vue d’ensemble</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <div className="flex flex-1 items-center justify-center p-5 sm:p-8">
        <div className="flex max-w-sm flex-col items-center text-center">
          <div className="mb-5 grid size-12 place-items-center rounded-xl border bg-card">
            <LibraryBig className="size-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <h2 className="text-base font-medium">Votre espace est prêt</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            La bibliothèque PTShelf accueillera bientôt vos projets, templates et presets.
          </p>
        </div>
      </div>
    </section>
  );
}
