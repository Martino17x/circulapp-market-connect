import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, TrendingUp, Package, Calendar, Settings, Edit3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ItemCard, { Item } from "@/components/circulapp/ItemCard";
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
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);

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
      "Gestiona tu perfil, estadísticas y articulos publicados en Circulapp."
    );
    fetchUserStats();
    fetchUserItems();
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

  const fetchUserItems = async () => {
    if (!user) return;

    try {
      setItemsLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select(`
          id,
          title,
          description,
          material_type,
          weight_kg,
          location_name,
          image_urls,
          status,
          created_at,
          price,
          is_free,
          user_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedItems: Item[] = data?.map(item => {
        const imagePath = (item.image_urls && item.image_urls.length > 0) ? item.image_urls[0] : null;
        console.log("Item image_urls:", item.image_urls); // LOG AQUI
        let imageUrl;

        if (imagePath) {
          // Si la ruta ya es una URL completa (empieza con http/https), usarla directamente
          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            imageUrl = imagePath;
          } else {
            // Si es una ruta relativa, construir la URL pública
            const cleanedImagePath = imagePath.startsWith('public/item-images/')
              ? imagePath.substring('public/item-images/'.length)
              : imagePath;
            imageUrl = supabase.storage.from('item-images').getPublicUrl(cleanedImagePath).data.publicUrl;
          }
        } else {
          imageUrl = `/src/assets/circulapp/${item.material_type}.jpg`;
        }

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          material_type: item.material_type,
          weightKg: Number(item.weight_kg),
          locationName: item.location_name,
          image: imageUrl,
          status: item.status,
          created_at: item.created_at,
          price: item.price || 0,
          isFree: item.is_free || false,
          user_id: item.user_id
        };
      }) || [];

      setUserItems(formattedItems);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar tus articulos",
        variant: "destructive"
      });
    } finally {
      setItemsLoading(false);
    }
  };

  const activeItems = userItems.filter(m => m.status === 'disponible');
  const completedItems = userItems.filter(m => m.status === 'retirado');

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
          <Button variant="outline" asChild>
            <Link to="/app/editar-perfil">
              <Edit3 className="mr-2 h-4 w-4" />
              Editar mi perfil
            </Link>
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
                  <CardTitle className="text-sm font-medium">Articulos publicados</CardTitle>
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
                    Articulo compartido
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
                    Articulos entregados
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
                    Articulo m��s publicado
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Items Tabs */}
      <section>
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Articulos activos ({activeItems.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completados ({completedItems.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Todos ({userItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Articulos disponibles</CardTitle>
                <CardDescription>
                  Articulos que actualmente están disponibles para recolección
                </CardDescription>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
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
                ) : activeItems.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeItems.map((item) => (
                      <ItemCard key={item.id} item={item} showEditButton={true} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tienes articulos activos</h3>
                    <p className="text-muted-foreground mb-4">
                      Publica tu primer Articulo para comenzar a participar
                    </p>
                    <Button>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Publicar Articulo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Articulos completados</CardTitle>
                <CardDescription>
                  Historial de articulos que ya fueron recolectados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
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
                ) : completedItems.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {completedItems.map((item) => (
                      <div key={item.id} className="relative">
                        <ItemCard item={item} showEditButton={true} />
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
                    <h3 className="text-lg font-semibold mb-2">No tienes articulos completados</h3>
                    <p className="text-muted-foreground mb-4">
                      Aquí aparecerán los articulos que hayas entregado exitosamente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Todos los articulos</CardTitle>
                <CardDescription>
                  Historial completo de todos tus articulos publicados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
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
                ) : userItems.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {userItems.map((item) => (
                      <div key={item.id} className="relative">
                        <ItemCard item={item} showEditButton={true} />
                        {item.status === 'retirado' && (
                          <Badge 
                            variant="secondary" 
                            className="absolute top-2 right-2 bg-green-100 text-green-800"
                          >
                            Completado
                          </Badge>
                        )}
                        {item.status === 'reservado' && (
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
                    <h3 className="text-lg font-semibold mb-2">No tienes articulos publicados</h3>
                    <p className="text-muted-foreground mb-4">
                      Comienza a compartir articulos con tu comunidad
                    </p>
                    <Button>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Publicar primer articulo
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