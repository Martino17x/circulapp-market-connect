import { useEffect, useState, useMemo } from "react";
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
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
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
    fetchAndSetItems(activeFilters);
  }, []);

  const fetchAndSetItems = async (filters: FilterValues) => {
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
          image_urls,
          status,
          created_at,
          price,
          is_free,
          user_id,
          user:profiles (full_name, username)
        `)
        .eq('status', 'disponible');

      // Apply filters to the Supabase query
      if (filters.category && filters.category !== 'todos') {
        query = query.eq('material_type', filters.category);
      }
      if (filters.minWeight > 0) {
        query = query.gte('weight_kg', filters.minWeight);
      }
      if (filters.q) {
        query = query.textSearch('title', filters.q, { type: 'websearch' });
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: `No se pudieron cargar los ítems: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      const formattedItems: Item[] = data?.map(item => {
        const imagePath = (item.image_urls && item.image_urls.length > 0) ? item.image_urls[0] : null;
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
          ...item,
          userName: (item.user as any)?.full_name || (item.user as any)?.username || 'Anónimo',
          image: imageUrl // Añadimos la URL de la imagen construida
        };
      }) || [];

      setItems(formattedItems);
    } catch (error: any) {
      toast({
        title: "Error general",
        description: error.message || "Ocurrió un error al cargar los ítems",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setActiveFilters(newFilters);
    fetchAndSetItems(newFilters);
  };

  // Client-side search is simpler now
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item => 
      (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (item.location_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, items]);

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
              placeholder="Buscar por título o ubicación..."
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
            <SearchFilters onChange={handleFiltersChange} initialValues={activeFilters} />
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
                item={item} 
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
              handleFiltersChange({
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