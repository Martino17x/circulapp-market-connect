import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, TrendingUp, Package, Calendar, Settings, Edit3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MaterialCard, { Material } from "@/components/circulapp/MaterialCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface UserStats {
  total_posts: number;
  total_weight_kg: number;
  active_posts: number;
  completed_posts: number;
  most_frequent_type: string;
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

export default function UserProfile() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userMaterials, setUserMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.username) {
      return user.user_metadata.username;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    document.title = "Mi Perfil | Circulapp";
    setMeta(
      "description",
      "Gestiona tu perfil, estadísticas y materiales publicados en Circulapp."
    );
    fetchUserStats();
    fetchUserMaterials();
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_stats', { target_user_id: user.id });

      if (error) throw error;

      if (data && data.length > 0) {
        setUserStats({
          total_posts: Number(data[0].total_posts) || 0,
          total_weight_kg: Number(data[0].total_weight_kg) || 0,
          active_posts: Number(data[0].active_posts) || 0,
          completed_posts: Number(data[0].completed_posts) || 0,
          most_frequent_type: data[0].most_frequent_type || 'N/A'
        });
      } else {
        // Default stats for new users
        setUserStats({
          total_posts: 0,
          total_weight_kg: 0,
          active_posts: 0,
          completed_posts: 0,
          most_frequent_type: 'N/A'
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMaterials = async () => {
    if (!user) return;

    try {
      setMaterialsLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select(`
          id,
          title,
          description,
          material_type,
          weight_kg,
          location_name,
          image_url,
          status,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMaterials: Material[] = data?.map(item => ({
        id: item.id,
        type: item.material_type,
        weightKg: Number(item.weight_kg),
        locationName: item.location_name,
        distanceKm: 0, // Own materials
        image: item.image_url || `/src/assets/circulapp/${item.material_type}.jpg`,
        userName: getUserName(),
        status: item.status
      })) || [];

      setUserMaterials(formattedMaterials);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar tus materiales",
        variant: "destructive"
      });
    } finally {
      setMaterialsLoading(false);
    }
  };

  const activeMaterials = userMaterials.filter(m => m.status === 'disponible');
  const completedMaterials = userMaterials.filter(m => m.status === 'retirado');

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{getUserName()}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Miembro desde {new Date(user?.created_at || '').toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Materiales publicados</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.total_posts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {userStats?.active_posts || 0} activos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peso total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.total_weight_kg || 0} kg</div>
                  <p className="text-xs text-muted-foreground">
                    Material compartido
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completados</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.completed_posts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Materiales entregados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tipo frecuente</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {userStats?.most_frequent_type || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Material más publicado
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Materials Tabs */}
      <section>
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Materiales activos ({activeMaterials.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completados ({completedMaterials.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Todos ({userMaterials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Materiales disponibles</CardTitle>
                <CardDescription>
                  Materiales que actualmente están disponibles para recolección
                </CardDescription>
              </CardHeader>
              <CardContent>
                {materialsLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                        <div className="space-y-2 p-4">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activeMaterials.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeMaterials.map((material) => (
                      <MaterialCard key={material.id} material={material} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tienes materiales activos</h3>
                    <p className="text-muted-foreground mb-4">
                      Publica tu primer material para comenzar a participar
                    </p>
                    <Button>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Publicar material
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Materiales completados</CardTitle>
                <CardDescription>
                  Historial de materiales que ya fueron recolectados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {materialsLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                        <div className="space-y-2 p-4">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : completedMaterials.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {completedMaterials.map((material) => (
                      <div key={material.id} className="relative">
                        <MaterialCard material={material} />
                        <Badge 
                          variant="secondary" 
                          className="absolute top-2 right-2 bg-green-100 text-green-800"
                        >
                          Completado
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tienes materiales completados</h3>
                    <p className="text-muted-foreground">
                      Aquí aparecerán los materiales que hayas entregado exitosamente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Todos los materiales</CardTitle>
                <CardDescription>
                  Historial completo de todos tus materiales publicados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {materialsLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                        <div className="space-y-2 p-4">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userMaterials.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {userMaterials.map((material) => (
                      <div key={material.id} className="relative">
                        <MaterialCard material={material} />
                        {material.status === 'retirado' && (
                          <Badge 
                            variant="secondary" 
                            className="absolute top-2 right-2 bg-green-100 text-green-800"
                          >
                            Completado
                          </Badge>
                        )}
                        {material.status === 'reservado' && (
                          <Badge 
                            variant="secondary" 
                            className="absolute top-2 right-2 bg-yellow-100 text-yellow-800"
                          >
                            Reservado
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tienes materiales publicados</h3>
                    <p className="text-muted-foreground mb-4">
                      Comienza a compartir materiales con tu comunidad
                    </p>
                    <Button>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Publicar primer material
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}