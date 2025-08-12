import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, MapPin, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface MaterialForm {
  title: string;
  description: string;
  material_type: string;
  weight_kg: number;
  location_name: string;
}

const materialTypes = [
  { value: "plastico", label: "Plástico" },
  { value: "carton", label: "Cartón" },
  { value: "vidrio", label: "Vidrio" },
  { value: "metal", label: "Metal" },
  { value: "papel", label: "Papel" },
  { value: "organico", label: "Orgánico" },
  { value: "textil", label: "Textil" },
  { value: "electronico", label: "Electrónico" },
  { value: "otro", label: "Otro" }
];

const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function PublishMaterial() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<MaterialForm>();

  const selectedType = watch("material_type");

  useEffect(() => {
    document.title = "Publicar Material | Circulapp";
    setMeta(
      "description",
      "Publica materiales reutilizables en tu comunidad y contribuye a la economía circular."
    );
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: MaterialForm) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para publicar materiales",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // For now, we'll use placeholder images based on material type
      // In production, you would upload the actual image to Supabase Storage
      if (selectedType) {
        imageUrl = `/src/assets/circulapp/${selectedType}.jpg`;
      }

      const { data: materialData, error } = await supabase
        .from('materials')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          material_type: data.material_type,
          weight_kg: data.weight_kg,
          location_name: data.location_name,
          image_url: imageUrl
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "¡Material publicado!",
        description: "Tu material ha sido publicado exitosamente en el marketplace."
      });

      navigate("/app/marketplace");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar el material",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Publicar Material</h1>
          <p className="text-muted-foreground">
            Comparte materiales reutilizables con tu comunidad
          </p>
        </div>
      </section>

      {/* Form */}
      <section>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Información del Material</CardTitle>
            <CardDescription>
              Completa los detalles para que otros usuarios puedan encontrar tu material
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título del material *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Cartón corrugado limpio"
                  {...register("title", { required: "El título es obligatorio" })}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Material Type */}
              <div className="space-y-2">
                <Label htmlFor="material_type">Tipo de material *</Label>
                <Select onValueChange={(value) => setValue("material_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.material_type && (
                  <p className="text-sm text-destructive">Selecciona un tipo de material</p>
                )}
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Peso estimado (kg) *</Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="weight_kg"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="Ej: 5.5"
                    className="pl-10"
                    {...register("weight_kg", {
                      required: "El peso es obligatorio",
                      valueAsNumber: true,
                      min: { value: 0.1, message: "El peso debe ser mayor a 0" }
                    })}
                  />
                </div>
                {errors.weight_kg && (
                  <p className="text-sm text-destructive">{errors.weight_kg.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location_name">Ubicación *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location_name"
                    placeholder="Ej: Palermo, CABA"
                    className="pl-10"
                    {...register("location_name", { required: "La ubicación es obligatoria" })}
                  />
                </div>
                {errors.location_name && (
                  <p className="text-sm text-destructive">{errors.location_name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el estado del material, condiciones de retiro, etc."
                  rows={4}
                  {...register("description")}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Foto del material</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto max-h-48 rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                      >
                        Cambiar imagen
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div>
                        <Button type="button" variant="outline" asChild>
                          <label htmlFor="image" className="cursor-pointer">
                            Seleccionar imagen
                          </label>
                        </Button>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageSelect}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG hasta 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/app/marketplace")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Publicando..." : "Publicar Material"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}