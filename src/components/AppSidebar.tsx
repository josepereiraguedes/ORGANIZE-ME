import { 
  Key, 
  CheckSquare, 
  Repeat, 
  StickyNote, 
  Star, 
  History,
  Home,
  Shield,
  Zap,
  Calendar
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Logins", url: "/logins", icon: Key },
  { title: "Tarefas", url: "/tasks", icon: CheckSquare },
  { title: "Rotinas", url: "/routines", icon: Repeat },
  { title: "Notas", url: "/notes", icon: StickyNote },
  { title: "Favoritos", url: "/favorites", icon: Star },
  { title: "Histórico", url: "/history", icon: History },
];

const quickActions = [
  { title: "Segurança", url: "/security", icon: Shield },
  { title: "Automação", url: "/automation", icon: Zap },
  { title: "Agenda", url: "/calendar", icon: Calendar },
];

export function AppSidebar() {
  const { state } = useSidebar();
  
  // Sempre mostrar os textos quando a sidebar estiver expandida (aplicativo web)
  const showText = state !== "collapsed";

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium hover:bg-primary/20" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"}>
      <SidebarContent className="bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {showText && (
              <div>
                <h2 className="font-semibold text-sm">OrganizerPro</h2>
                <p className="text-xs text-muted-foreground">Sua vida organizada</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {showText && "Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {showText && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {showText && "Ferramentas"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {showText && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <div className="mt-auto p-4 border-t border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            {showText && (
              <span className="text-sm font-medium">Tema</span>
            )}
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">U</span>
            </div>
            {showText && (
              <div className="truncate">
                <p className="text-sm font-medium">Usuário</p>
                <p className="text-xs text-muted-foreground">usuario@email.com</p>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}