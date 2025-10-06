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
  Calendar,
  User,
  LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
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
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

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
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Usuário');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  
  // Obter dados do usuário do localStorage
  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    const savedUserPhoto = localStorage.getItem('userPhoto');
    
    if (savedUserName) {
      setUserName(savedUserName);
    }
    
    if (savedUserPhoto) {
      setUserPhoto(savedUserPhoto);
    }
    
    // Ouvir eventos de atualização do nome e foto do usuário
    const handleUserNameUpdate = (event: CustomEvent) => {
      setUserName(event.detail);
    };
    
    const handleUserPhotoUpdate = (event: CustomEvent) => {
      setUserPhoto(event.detail);
    };
    
    window.addEventListener('userNameUpdated', handleUserNameUpdate as EventListener);
    window.addEventListener('userPhotoUpdated', handleUserPhotoUpdate as EventListener);
    
    return () => {
      window.removeEventListener('userNameUpdated', handleUserNameUpdate as EventListener);
      window.removeEventListener('userPhotoUpdated', handleUserPhotoUpdate as EventListener);
    };
  }, []);
  
  // Sempre mostrar os textos quando a sidebar estiver expandida (aplicativo web)
  const showText = state !== "collapsed";
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium hover:bg-primary/20" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  const handleLogout = () => {
    // Remover dados do usuário do localStorage
    localStorage.removeItem('hasVisited');
    localStorage.removeItem('userName');
    localStorage.removeItem('userTheme');
    localStorage.removeItem('userPhoto');
    
    // Redirecionar para a página de login
    navigate('/');
    window.location.reload();
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"}>
      <SidebarContent className="bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Logo />
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
              {userPhoto ? (
                <img 
                  src={userPhoto} 
                  alt="Foto do usuário" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            {showText && (
              <div className="truncate">
                <p className="text-sm font-medium">{userName}</p>
                <div className="flex gap-2 mt-1">
                  <NavLink to="/security" className="text-xs text-muted-foreground hover:text-foreground">
                    Editar perfil
                  </NavLink>
                  <button 
                    onClick={handleLogout}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Botão de logout para modo colapsado */}
          {!showText && (
            <div className="flex justify-center">
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}