import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[1600px]">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
