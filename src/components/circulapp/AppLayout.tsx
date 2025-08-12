import { useState } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Plus,
  Search,
  Map,
  MessageCircle,
  Recycle,
  User,
  AlertTriangle,
  LogOut,
  Menu,
  Bell,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Navegación principal para móvil (bottom nav)
const mobileMainItems = [
  {
    title: "Inicio",
    url: "/app",
    icon: Home,
    description: "Vista general"
  },
  {
    title: "Buscar",
    url: "/app/buscar",
    icon: Search,
    description: "Explorar materiales"
  },
  {
    title: "Publicar",
    url: "/app/publicar",
    icon: Plus,
    description: "Añadir material",
    primary: true
  },
  {
    title: "Mapa",
    url: "/app/mapa",
    icon: Map,
    description: "Ver ubicaciones"
  },
  {
    title: "Más",
    url: "#",
    icon: MoreHorizontal,
    description: "Más opciones"
  },
];

// Navegación completa para desktop
const navigationItems = [
  {
    title: "Inicio",
    url: "/app",
    icon: Home,
    description: "Vista general del marketplace"
  },
  {
    title: "Publicar material",
    url: "/app/publicar",
    icon: Plus,
    description: "Añadir nuevos materiales"
  },
  {
    title: "Buscar materiales",
    url: "/app/buscar",
    icon: Search,
    description: "Explorar el catálogo"
  },
  {
    title: "Mapa",
    url: "/app/mapa",
    icon: Map,
    description: "Ver ubicaciones"
  },
  {
    title: "Chat",
    url: "/app/chat",
    icon: MessageCircle,
    description: "Conversaciones"
  },
  {
    title: "Recolección",
    url: "/app/recoleccion",
    icon: Recycle,
    description: "Gestionar recolecciones"
  },
];

const secondaryItems = [
  {
    title: "Mi perfil",
    url: "/app/perfil",
    icon: User,
    description: "Configurar cuenta"
  },
  {
    title: "Denuncias",
    url: "/app/denuncias",
    icon: AlertTriangle,
    description: "Reportar problemas"
  },
];

// Items adicionales para el menú móvil
const mobileSecondaryItems = [
  {
    title: "Chat",
    url: "/app/chat",
    icon: MessageCircle,
    description: "Conversaciones"
  },
  {
    title: "Recolección",
    url: "/app/recoleccion",
    icon: Recycle,
    description: "Gestionar recolecciones"
  },
  ...secondaryItems
];

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path || (path === "/app" && currentPath === "/app/");
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/20 text-primary font-semibold border-r-2 border-primary" 
      : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground transition-colors";

  return (
    <Sidebar className={`border-sidebar-border transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`} collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">C</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">Circulapp</h2>
              <p className="text-xs text-sidebar-foreground/70">Economía circular</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
            {!collapsed ? "Principal" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      title={collapsed ? item.description : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
            {!collapsed ? "Cuenta" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      title={collapsed ? item.description : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <LogoutButton collapsed={collapsed} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const { signOut } = useAuth();
  
  return (
    <button 
      className="w-full text-left text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground flex items-center gap-3"
      onClick={signOut}
      title={collapsed ? "Cerrar sesión" : undefined}
    >
      <LogOut className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span>Cerrar sesión</span>}
    </button>
  );
}

function TopBar() {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/app" || path === "/app/") return "Inicio";
    if (path === "/app/publicar") return "Publicar Material";
    if (path === "/app/buscar" || path === "/app/marketplace") return "Marketplace";
    if (path === "/app/mapa") return "Mapa";
    if (path === "/app/chat") return "Chat";
    if (path === "/app/recoleccion") return "Recolección";
    if (path === "/app/perfil") return "Mi Perfil";
    if (path === "/app/denuncias") return "Denuncias";
    return "Circulapp";
  };
  
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">{getPageTitle()}</h1>
          {!isMobile && (
            <p className="text-sm text-muted-foreground">Gestiona tu actividad en Circulapp</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative hover:bg-muted">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center animate-pulse">
            2
          </span>
          <span className="sr-only">Notificaciones</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt={user?.email || "Usuario"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">Usuario activo</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/app/perfil" className="w-full cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Mi perfil</span>
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Componente de navegación inferior para móviles
function MobileBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const isActive = (path: string) => currentPath === path || (path === "/app" && currentPath === "/app/");
  
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-t border-border lg:hidden">
        <div className="flex items-center justify-around py-2 px-1">
          {mobileMainItems.map((item) => {
            if (item.url === "#") {
              return (
                <Sheet key={item.title} open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
                  <SheetTrigger asChild>
                    <button className="flex flex-col items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors min-w-0 flex-1">
                      <item.icon className="h-5 w-5 mb-1" />
                      <span className="text-xs truncate">{item.title}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[60vh]">
                    <div className="flex flex-col space-y-4 pt-4">
                      <h3 className="text-lg font-semibold mb-4">Más opciones</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {mobileSecondaryItems.map((secondaryItem) => (
                          <NavLink
                            key={secondaryItem.title}
                            to={secondaryItem.url}
                            onClick={() => setIsMoreMenuOpen(false)}
                            className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                              isActive(secondaryItem.url) 
                                ? "bg-primary/10 border-primary text-primary" 
                                : "hover:bg-muted border-border"
                            }`}
                          >
                            <secondaryItem.icon className="h-6 w-6 mb-2" />
                            <span className="text-sm font-medium text-center">{secondaryItem.title}</span>
                            <span className="text-xs text-muted-foreground text-center mt-1">{secondaryItem.description}</span>
                          </NavLink>
                        ))}
                      </div>
                      
                      <div className="pt-4 mt-4 border-t">
                        <LogoutButton collapsed={false} />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              );
            }
            
            const active = isActive(item.url);
            
            if (item.primary) {
              return (
                <div
                  key={item.title}
                  className="flex flex-col items-center justify-center p-2 transition-colors min-w-0 flex-1 relative"
                >
                  <NavLink 
                    to={item.url}
                    className="flex flex-col items-center justify-center p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    <item.icon className="h-6 w-6" />
                  </NavLink>
                </div>
              );
            }
            
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center justify-center p-2 transition-colors min-w-0 flex-1 ${
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs truncate">{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
      
      {/* Espaciado para el bottom nav */}
      <div className="h-16 lg:hidden" />
    </>
  );
}

export default function AppLayout() {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar solo en desktop */}
        {!isMobile && <AppSidebar />}
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          
          <main className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
          
          {/* Navegación inferior solo en móvil */}
          {isMobile && <MobileBottomNav />}
        </div>
      </div>
    </SidebarProvider>
  );
}