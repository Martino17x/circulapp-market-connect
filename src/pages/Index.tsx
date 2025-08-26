import BrandHeader from "@/components/circulapp/BrandHeader";
import ItemCard, { Item } from "@/components/circulapp/ItemCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SearchFilters, { FilterValues } from "@/components/circulapp/SearchFilters";

// Helper to set meta tags
const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const Index = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHasPublished, setUserHasPublished] = useState(false);
  const [checkingPublishStatus, setCheckingPublishStatus] = useState(true);
  // State for filters is kept for display purposes, but logic is disconnected.
  const [filters, setFilters] = useState<FilterValues>({ q: "", category: "todos", maxDistance: 10, minWeight: 0 });

  useEffect(() => {
    document.title = "Circulapp - Marketplace Comunitario";
    setMeta(
      "description",
      "Dale una segunda vida a todo. Conecta con tu comunidad para intercambiar desde electrodomésticos y muebles hasta ítems como plástico, cartón y vidrio. Únete a la economía circular"
    );
    fetchItems();
  }, []);

  useEffect(() => {
    const checkUserPublications = async () => {
      if (!user) {
        setCheckingPublishStatus(false);
        return;
      }
      try {
        setCheckingPublishStatus(true);
        const { data, error } = await supabase
          .from('items')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          console.error("Error checking user publications:", error);
        } else {
          setUserHasPublished(data && data.length > 0);
        }
      } catch (error) {
        console.error("Unexpected error checking publications:", error);
      } finally {
        setCheckingPublishStatus(false);
      }
    };

    checkUserPublications();
  }, [user]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select(`
          id,
          title,
          description,
          material_type,
          weight_kg,
          location_name,
          image_url,
          price,
          is_free,
          created_at,
          user_id
        `)
        .eq('status', 'disponible')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching items:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los ítems",
          variant: "destructive"
        });
        return;
      }

      if (!data || data.length === 0) {
        setItems([]);
      } else {
        const userIds = [...new Set(data.map(item => item.user_id))];
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, username, full_name')
          .in('user_id', userIds);

        if (profileError) {
          console.error('Error fetching profiles:', profileError);
        }

        const profileMap = profiles?.reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {} as Record<string, any>) || {};

        const formattedItems: Item[] = data.map(item => {
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
            price: item.is_free ? 0 : Number(item.price || 0),
            isFree: item.is_free || false
          };
        });
        setItems(formattedItems);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los ítems",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPublishButtonText = () => {
    if (!user) return "Publicar Artículo";
    if (checkingPublishStatus) return "Cargando...";
    if (userHasPublished) return "Publicar Otro Artículo";
    return "Publicar tu Primer Artículo";
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((m, idx) => ({
      "@type": "Product",
      position: idx + 1,
      name: m.type,
      brand: "Circulapp",
      category: "Ítem reutilizable",
      image: m.image,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        seller: { "@type": "Person", name: m.userName },
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrandHeader />

      <main>
        {/* Hero */}
        <section className="bg-hero">
          <div className="container mx-auto py-10 text-center text-primary-foreground">
            <h1 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl">
              Circulapp: Marketplace de ítems reutilizables
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg opacity-90">
              Publica, encuentra y reutiliza ítems, productos y articulos. Simple, accesible y colaborativo.
            </p>
          </div>
        </section>

        {/* Search + filters (visual only) */}
        <SearchFilters onChange={() => {}} />

        {/* Publish Button */}
        <section className="container mx-auto my-6">
          <div className="flex justify-center">
            <Button size="lg" asChild className="shadow-elegant" disabled={checkingPublishStatus}>
              <Link to="/app/publicar">
                <Plus className="mr-2 h-5 w-5" />
                {getPublishButtonText()}
              </Link>
            </Button>
          </div>
        </section>

        {/* Results grid */}
        <section aria-label="Resultados" className="container mx-auto my-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                {loading ? "Cargando..." : `${items.length} ítem${items.length !== 1 ? "s" : ""} disponible${items.length !== 1 ? "s" : ""}`}
              </span>
              {!loading && (
                <>
                  <span className="hidden md:inline">·</span>
                  <span className="hidden md:inline">Categoría: {filters.category}</span>
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/app/mapa">Ver Mapa</Link>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
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
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
              {items.map((m) => (
                <ItemCard key={m.id} item={m} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay ítems disponibles</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Sé el primero en compartir ítems reutilizables en tu comunidad
              </p>
              <Button asChild>
                <Link to="/app/publicar">
                  <Plus className="mr-2 h-4 w-4" />
                  Publicar primer artículo
                </Link>
              </Button>
            </div>
          )}
        </section>

        {/* SEO structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>
    </div>
  );
};

export default Index;