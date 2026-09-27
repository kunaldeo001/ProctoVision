import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GlobalSearch } from '@/components/global-search';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen relative w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <GlobalSearch />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
