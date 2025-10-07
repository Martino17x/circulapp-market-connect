import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Recycle, MapPin, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  title: string;
  value: string;
  description: string;
  icon: any;
  trend: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status: string;
}

const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Extract user name from user metadata or email
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.user_metadata?.username) {
      return user.user_metadata.username;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      // Fetch user's items count
      const { data: userItems, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id);

      if (itemsError) throw itemsError;

      // Fetch total items count for connections metric
      const { data: allItems, error: allItemsError } = await supabase
        .from('items')
        .select('id');

      if (allItemsError) throw allItemsError;

      // Calculate stats
      const publishedCount = userItems?.length || 0;
      const soldCount = userItems?.filter(m => m.status === 'sold')?.length || 0;
      const reusedCount = userItems?.filter(m => m.status === 'completed')?.length || 0;
      const connectionsCount = allItems?.length || 0;

      const dashboardStats: DashboardStats[] = [
        {
          title: "Articulos publicados",
          value: publishedCount.toString(),
          description: "Total de publicaciones",
          icon: Plus,
          trend: "+0%"
        },
        {
          title: "Articulos vendidos",
          value: soldCount.toString(),
          description: "Transacciones exitosas",
          icon: ShoppingCart,
          trend: "+0%"
        },
        {
          title: "Reutilizados",
          value: reusedCount.toString(),
          description: "Impacto positivo",
          icon: Recycle,
          trend: "+0%"
        },
        {
          title: "Conexiones activas",
          value: connectionsCount.toString(),
          description: "Total en la plataforma",
          icon: Users,
          trend: "+0%"
        }
      ];

      setStats(dashboardStats);

      // Create recent activities from user's items
      const activities: RecentActivity[] = userItems?.slice(0, 4).map((item, index) => ({
        id: item.id,
        type: "item_added",
        title: `Publicaste: ${item.title}`,
        description: `${item.material_type} - ${item.weight_kg}kg`,
        time: new Date(item.created_at).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: item.status || 'active'
      })) || [];

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Inicio | Circulapp";
    setMeta(
      "description",
      "Panel de control de Circulapp: gestiona tus Articulos, conexiones y actividad en la economía circular."
    );
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <section>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">¡Hola, {getUserName()}!</h1>
            <p className="text-muted-foreground">
              Tu impacto en la economía circular está creciendo. Aquí está tu actividad reciente.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/app/marketplace">
                Ver Marketplace
              </Link>
            </Button>
            <Button asChild>
              <Link to="/app/publicar">
                <Plus className="mr-2 h-4 w-4" />
                Publicar Articulo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat) => (
              <Card key={stat.title} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {stat.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Actividad reciente */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>
              Un resumen de tus últimas interacciones en Circulapp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg">
                    <div className="h-2 w-2 rounded-full mt-2 bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.status === 'active' ? 'bg-primary' :
                      activity.status === 'pending' ? 'bg-accent' : 
                      activity.status === 'sold' ? 'bg-green-500' : 'bg-muted-foreground'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none mb-1">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        activity.status === 'active' ? 'default' :
                        activity.status === 'pending' ? 'secondary' : 
                        activity.status === 'sold' ? 'default' : 'outline'
                      }
                      className="text-xs"
                    >
                      {activity.status === 'active' ? 'Activo' :
                       activity.status === 'pending' ? 'Pendiente' : 
                       activity.status === 'sold' ? 'Vendido' : 'Completado'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay actividad reciente</p>
                  <p className="text-xs mt-1">Comienza publicando tu primer Articulo</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Accesos rápidos */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
            <CardDescription>
              Herramientas principales para gestionar tu actividad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link to="/app/marketplace">
                  <div className="text-left">
                    <div className="font-medium">Explorar ítems</div>
                    <div className="text-xs text-muted-foreground">Buscar en tu zona</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link to="/app/mapa">
                  <div className="text-left">
                    <div className="font-medium">Ver mapa</div>
                    <div className="text-xs text-muted-foreground">Ubicaciones cercanas</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link to="/app/chat">
                  <div className="text-left">
                    <div className="font-medium">Mensajes</div>
                    <div className="text-xs text-muted-foreground">2 conversaciones</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link to="/">
                  <div className="text-left">
                    <div className="font-medium">Landing</div>
                    <div className="text-xs text-muted-foreground">Ir a la página principal</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
