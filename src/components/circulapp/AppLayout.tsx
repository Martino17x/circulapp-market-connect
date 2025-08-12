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
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Inicio",
    url: "/app",
    icon: Home,
    description: "Vista general del marketplace",
    mobileOrder: 1
  },
  {
    title: "Marketplace",
    url: "/app/marketplace",
    icon: Search,
    description: "Explorar materiales",
    mobileOrder: 2
  },
  {
    title: "Publicar",
    url: "/app/publicar",
    icon: Plus,
    description: "Añadir nuevos materiales",
    mobileOrder: 3,
    highlight: true
  },
  {
    title: "Mapa",
    url: "/app/mapa",
    icon: Map,
    description: "Ver ubicaciones",
    mobileOrder: 4
  },
  {
    title: "Chat",
    url: "/app/chat",
    icon: MessageCircle,
    description: "Conversaciones",
    mobileOrder: 5
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

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path || (path === "/app" && currentPath === "/app/");
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

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

function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const mobileItems = navigationItems
    .filter(item => item.mobileOrder)
    .sort((a, b) => (a.mobileOrder || 0) - (b.mobileOrder || 0));

  const isActive = (path: string) => currentPath === path || (path === "/app" && currentPath === "/app/");

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors rounded-lg",
              isActive(item.url)
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground",
              item.highlight && !isActive(item.url) && "text-primary"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5", 
              item.highlight && !isActive(item.url) && "text-primary"
            )} />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
        <NavLink
          to="/app/perfil"
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors rounded-lg",
            isActive("/app/perfil")
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="h-5 w-5" />
          <span className="font-medium">Perfil</span>
        </NavLink>
      </div>
    </nav>
  );
}

function TopBar() {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/app':
        return 'Dashboard';
      case '/app/marketplace':
        return 'Marketplace';
      case '/app/publicar':
        return 'Publicar Material';
      case '/app/mapa':
        return 'Mapa';
      case '/app/chat':
        return 'Chat';
      case '/app/recoleccion':
        return 'Recolección';
      case '/app/perfil':
        return 'Mi Perfil';
      case '/app/denuncias':
        return 'Denuncias';
      default:
        return 'Circulapp';
    }
  };
  
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {isMobile ? getPageTitle() : 'Panel de control'}
          </h1>
          {!isMobile && (
            <p className="text-sm text-muted-foreground">Gestiona tu actividad en Circulapp</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center">
            2
          </span>
          <span className="sr-only">Notificaciones</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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

export default function AppLayout() {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          
          <main className={cn(
            "flex-1 overflow-auto p-4 lg:p-6",
            isMobile && "pb-20" // Add padding bottom for mobile bottom nav
          )}>
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
          
          <BottomNavigation />
        </div>
      </div>
    </SidebarProvider>
  );
}