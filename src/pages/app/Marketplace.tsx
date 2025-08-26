import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchFilters, { FilterValues } from "@/components/circulapp/SearchFilters";
import ItemCard, { Item } from "@/components/circulapp/ItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, SlidersHorizontal, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function Marketplace() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    q: "",
    category: "todos",
    maxDistance: 10,
    minWeight: 0
  });

  useEffect(() => {
    document.title = "Marketplace | Circulapp";
    setMeta(
      "description",
      "Explora ítems reutilizables disponibles en tu comunidad. Encuentra plástico, cartón, vidrio y más para proyectos de economía circular."
    );
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('items')
        .select(`
          id,
          title,
          description,
          material_type,
          weight_kg,
          location_name,
          image_url,
          created_at,
          user_id
        `)
        .eq('status', 'disponible')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los ítems",
          variant: "destructive"
        });
        return;
      }

      // Fetch user profiles for each item
      const userIds = [...new Set(data?.map(item => item.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, full_name')
        .in('user_id', userIds);

      const profileMap = profiles?.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>) || {};

      const formattedItems: Item[] = data?.map(item => {
        const profile = profileMap[item.user_id];
        return {
          id: item.id,
          type: item.material_type,
          weightKg: Number(item.weight_kg),
          locationName: item.location_name,
          distanceKm: Math.random() * 5 + 0.5, // TODO: Calculate real distance
          image: item.image_url || `/src/assets/circulapp/${item.material_type}.jpg`,
          userName: profile?.full_name || profile?.username || 'Usuario Anónimo',
          title: item.title,
          price: 0,
          isFree: true
        };
      }) || [];

      setItems(formattedItems);
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los ítems",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    // Apply filters to items list
    applyFilters(newFilters);
  };

  const applyFilters = async (filterValues: FilterValues) => {
    try {
      setLoading(true);
      let query = supabase
        .from('items')
        .select(`
          id,
          title,
          description,
          material_type,
          weight_kg,
          location_name,
          image_url,
          created_at,
          user_id
        `)
        .eq('status', 'disponible');

      // Apply category filter
      if (filterValues.category && filterValues.category !== 'todos') {
        query = query.eq('material_type', filterValues.category);
      }

      // Apply weight filter
      if (filterValues.minWeight > 0) {
        query = query.gte('weight_kg', filterValues.minWeight);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron aplicar los filtros",
          variant: "destructive"
        });
        return;
      }

      // Fetch user profiles
      const userIds = [...new Set(data?.map(item => item.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, full_name')
        .in('user_id', userIds);

      const profileMap = profiles?.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>) || {};

      const formattedItems: Item[] = data?.map(item => {
        const profile = profileMap[item.user_id];
        return {
          id: item.id,
          type: item.material_type,
          weightKg: Number(item.weight_kg),
          locationName: item.location_name,
          distanceKm: Math.random() * 5 + 0.5, // TODO: Calculate real distance
          image: item.image_url || `/src/assets/circulapp/${item.material_type}.jpg`,
          userName: profile?.full_name || profile?.username || 'Usuario Anónimo',
          title: item.title,
          price: 0,
          isFree: true
        };
      }) || [];

      setItems(formattedItems);
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al aplicar los filtros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filters.category === "todos" || item.type === filters.category;
    const matchesWeight = item.weightKg >= filters.minWeight;
    const matchesDistance = item.distanceKm <= filters.maxDistance;
    
    return matchesSearch && matchesCategory && matchesWeight && matchesDistance;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground">
              Descubre ítems reutilizables en tu comunidad
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/app/mapa">
                <Map className="mr-2 h-4 w-4" />
                Ver mapa
              </Link>
            </Button>
            <Button asChild>
              <Link to="/app/publicar">
                <Plus className="mr-2 h-4 w-4" />
                Publicar Ítem
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por tipo o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="px-3"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="animate-fade-in">
            <SearchFilters onChange={handleFiltersChange} />
          </div>
        )}
      </section>

      {/* Results */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Cargando..." : `${filteredItems.length} ítems encontrados`}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <ItemCard 
                key={item.id} 
                item={{
                  ...item,
                  image: item.image || `/src/assets/circulapp/${item.type}.jpg`
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron ítems</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Intenta ajustar tus filtros o explora una zona más amplia
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setFilters({
                q: "",
                category: "todos",
                maxDistance: 10,
                minWeight: 0
              });
            }}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
