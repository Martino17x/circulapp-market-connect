import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export interface FilterValues {
  q: string;
  category: string;
  maxDistance: number; // km
  minWeight: number;   // kg
}

export const CATEGORIES = [
  "Todos",
  "Plástico PET",
  "Cartón",
  "Vidrio",
  "Aluminio",
];

interface Props {
  onChange: (values: FilterValues) => void;
}

const SearchFilters = ({ onChange }: Props) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(!isMobile);
  const [values, setValues] = useState<FilterValues>({
    q: "",
    category: "Todos",
    maxDistance: 10,
    minWeight: 0,
  });

  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  return (
    <section aria-label="Búsqueda y filtros" className="container mx-auto mt-6">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm">
        {/* Search row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar por material o usuario"
              placeholder="Buscar por material o usuario..."
              className="pl-10"
              value={values.q}
              onChange={(e) => setValues((v) => ({ ...v, q: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2 md:w-auto">
            <Button
              type="button"
              variant="secondary"
              className="md:hidden"
              onClick={() => setOpen((o) => !o)}
            >
              <SlidersHorizontal />
              {open ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>
          </div>
        </div>

        {open && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={values.category}
                onValueChange={(val) => setValues((v) => ({ ...v, category: val }))}
              >
                <SelectTrigger aria-label="Seleccionar categoría">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Distancia */}
            <div className="space-y-2">
              <Label>Máx. cercanía (km): {values.maxDistance}</Label>
              <Slider
                value={[values.maxDistance]}
                max={30}
                step={1}
                onValueChange={(arr) => setValues((v) => ({ ...v, maxDistance: arr[0] }))}
                aria-label="Filtrar por distancia en kilómetros"
              />
            </div>

            {/* Peso */}
            <div className="space-y-2">
              <Label>Mín. peso (kg): {values.minWeight}</Label>
              <Slider
                value={[values.minWeight]}
                max={100}
                step={5}
                onValueChange={(arr) => setValues((v) => ({ ...v, minWeight: arr[0] }))}
                aria-label="Filtrar por peso mínimo en kilogramos"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchFilters;
