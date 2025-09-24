import BrandHeader from "@/components/circulapp/BrandHeader";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, Users, Repeat } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Item } from "@/components/circulapp/ItemCard";
import ItemCard from "@/components/circulapp/ItemCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext"; // Importar useAuth

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
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Obtener el usuario del contexto

  useEffect(() => {
    document.title = "Circulapp - Marketplace Comunitario de Economía Circular";
    setMeta(
      "description",
      "Dale una segunda vida a todo. Conecta con tu comunidad para intercambiar desde electrodomésticos y muebles hasta materiales como plástico, cartón y vidrio. Únete a la economía circular."
    );
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('id, title, material_type, image_urls, is_free, price, location_name, user_id, weight_kg, created_at')
        .eq('status', 'disponible')
        .order('created_at', { ascending: false })
        .limit(7);

      if (itemsError) throw itemsError;

      if (itemsData && itemsData.length > 0) {
        const userIds = [...new Set(itemsData.map(item => item.user_id))];
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, username, full_name')
          .in('user_id', userIds);

        if (profileError) throw profileError;

        const profileMap = profiles.reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {} as Record<string, { username: string; full_name: string }>);

        const formattedItems: Item[] = itemsData.map(item => {
          const profile = profileMap[item.user_id];
          
          const imagePath = (item.image_urls && item.image_urls.length > 0) ? item.image_urls[0] : null;
          let imageUrl;

          if (imagePath) {
            // Si la ruta ya es una URL completa (empieza con http/https), usarla directamente
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
              imageUrl = imagePath;
            } else {
              // Si es una ruta relativa, construir la URL pública
              // Eliminar el prefijo 'public/item-images/' si existe en la ruta almacenada
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
            type: item.material_type,
            image: imageUrl,
            title: item.title,
            price: item.is_free ? 0 : Number(item.price || 0),
            isFree: item.is_free || false,
            locationName: item.location_name,
            userName: profile?.full_name || profile?.username || 'Usuario Anónimo',
            weightKg: Number(item.weight_kg || 0),
            distanceKm: Math.random() * 5 + 0.5, // Placeholder
          };
        });
        setItems(formattedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching items for carousel:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrandHeader user={user} /> {/* Pasar el usuario al BrandHeader */}

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

        <HowItWorksSection />
        <RecentItemsSection items={items} loading={loading} />
        <ImpactSection />
        <CtaSection />
      </main>
    </div>
  );
};

// ... The rest of the components (HowItWorksSection, RecentItemsSection, etc.) remain the same ...

const HowItWorksSection = () => (
  <section className="py-16 sm:py-20">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-10">¿Cómo funciona?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-primary/10 text-primary p-4 mb-4">
            <Camera className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">1. Publica</h3>
          <p className="text-muted-foreground">
            Toma una foto de un ítem que ya no necesites, añade una descripción y publícalo en segundos.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-primary/10 text-primary p-4 mb-4">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">2. Conecta</h3>
          <p className="text-muted-foreground">
            Personas de tu barrio o comunidad verán tu artículo y podrán contactarte para coordinar la entrega.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-primary/10 text-primary p-4 mb-4">
            <Repeat className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">3. Reutiliza</h3>
          <p className="text-muted-foreground">
            Dale una segunda vida a tus objetos y contribuye a un modelo de consumo más sostenible y local.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const RecentItemsSection = ({ items, loading }: { items: Item[], loading: boolean }) => {
  if (loading) {
    return (
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Descubre los Últimos Ítems</h2>
          <div className="flex justify-center space-x-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full sm:w-1/2 md:w-1/3 p-1">
                 <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                 <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (items.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Descubre los Últimos Ítems</h2>
        <Carousel opts={{ align: "start", loop: items.length > 3 }} className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {items.map((item) => (
              <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <ItemCard item={item} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        <div className="text-center mt-10">
          <Button asChild size="lg" className="shadow-elegant">
            <Link to="/app/marketplace">Explorar el Marketplace</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const ImpactSection = () => {
  const materials = [
    { name: "Plástico", img: "/src/assets/circulapp/plastic-pet.jpg" },
    { name: "Vidrio", img: "/src/assets/circulapp/glass.jpg" },
    { name: "Cartón", img: "/src/assets/circulapp/cardboard.jpg" },
    { name: "Aluminio", img: "/src/assets/circulapp/aluminum.jpg" },
  ];

  return (
    <section className="py-16 sm:py-20 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">El Impacto de Reutilizar</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            Cada vez que reutilizas un objeto, estás reduciendo la demanda de nuevos productos, ahorrando energía y disminuyendo la cantidad de residuos que terminan en vertederos.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {materials.map((material) => (
            <div key={material.name} className="relative group rounded-lg overflow-hidden shadow-lg">
              <img src={material.img} alt={material.name} className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">{material.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CtaSection = () => (
  <section className="py-16 sm:py-24 text-center">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Únete a la Economía Circular</h2>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8">
        Forma parte del cambio. Empieza a publicar y encontrar artículos en tu comunidad para construir un futuro más sostenible.
      </p>
      <Button size="lg" asChild className="shadow-elegant">
        <Link to="/app">Empezar Ahora</Link>
      </Button>
    </div>
  </section>
);

export default Index;