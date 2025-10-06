import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingIcons } from "@/components/FloatingIcons";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  // Apenas a página de primeiro acesso (login) não deve mostrar ícones flutuantes
  const isLoginPage = location.pathname === '/' && !localStorage.getItem('hasVisited');
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
        <FloatingIcons />
        <AppSidebar />
        
        <div className="flex-1 flex flex-col relative z-10">
          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}