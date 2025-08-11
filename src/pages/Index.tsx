import BrandHeader from "@/components/circulapp/BrandHeader";
import SearchFilters, { FilterValues, CATEGORIES } from "@/components/circulapp/SearchFilters";
import MaterialCard, { Material } from "@/components/circulapp/MaterialCard";
import plasticImg from "@/assets/circulapp/plastic-pet.jpg";
import cardboardImg from "@/assets/circulapp/cardboard.jpg";
import glassImg from "@/assets/circulapp/glass.jpg";
import aluminumImg from "@/assets/circulapp/aluminum.jpg";
import { useMemo, useState } from "react";

const MOCK_MATERIALS: Material[] = [
  { id: "1", type: "Plástico PET", weightKg: 12, locationName: "Barrio Centro", distanceKm: 1.2, image: plasticImg, userName: "Ana" },
  { id: "2", type: "Cartón", weightKg: 30, locationName: "Barrio Norte", distanceKm: 3.4, image: cardboardImg, userName: "Luis" },
  { id: "3", type: "Vidrio", weightKg: 18, locationName: "Barrio Sur", distanceKm: 2.1, image: glassImg, userName: "María" },
  { id: "4", type: "Aluminio", weightKg: 8, locationName: "Barrio Oeste", distanceKm: 4.8, image: aluminumImg, userName: "Pedro" },
  { id: "5", type: "Plástico PET", weightKg: 25, locationName: "Barrio Este", distanceKm: 6.2, image: plasticImg, userName: "Juana" },
  { id: "6", type: "Cartón", weightKg: 15, locationName: "Barrio Centro", distanceKm: 0.9, image: cardboardImg, userName: "Tomás" },
  { id: "7", type: "Vidrio", weightKg: 40, locationName: "Barrio Norte", distanceKm: 7.0, image: glassImg, userName: "Sofía" },
  { id: "8", type: "Aluminio", weightKg: 22, locationName: "Barrio Sur", distanceKm: 5.5, image: aluminumImg, userName: "Diego" },
];

const Index = () => {
  const [filters, setFilters] = useState<FilterValues>({ q: "", category: "Todos", maxDistance: 10, minWeight: 0 });

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return MOCK_MATERIALS.filter((m) => {
      const matchText = q === "" || m.type.toLowerCase().includes(q) || m.userName.toLowerCase().includes(q);
      const matchCat = filters.category === "Todos" || m.type === filters.category;
      const matchDist = m.distanceKm <= filters.maxDistance;
      const matchWeight = m.weightKg >= filters.minWeight;
      return matchText && matchCat && matchDist && matchWeight;
    });
  }, [filters]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: filtered.map((m, idx) => ({
      "@type": "Product",
      position: idx + 1,
      name: m.type,
      brand: "Circulapp",
      category: "Material reutilizable",
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
              Circulapp: Marketplace de materiales reutilizables
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg opacity-90">
              Publica, encuentra y reutiliza materiales de tu barrio. Simple, accesible y colaborativo.
            </p>
          </div>
        </section>

        {/* Search + filters */}
        <SearchFilters onChange={setFilters} />

        {/* Results grid */}
        <section aria-label="Resultados" className="container mx-auto my-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">Categoría: {filters.category}</span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {filtered.map((m) => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        </section>

        {/* SEO structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>
    </div>
  );
};

export default Index;
