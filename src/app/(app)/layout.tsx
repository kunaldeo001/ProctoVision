import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-auto relative">
          {/* Mobile trigger */}
          <div className="sticky top-0 z-20 flex items-center h-10 px-3 border-b bg-background/80 backdrop-blur md:hidden">
            <SidebarTrigger className="h-8 w-8" />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
