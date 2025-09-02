import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, MapPin, Scale, DollarSign, X, ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ItemForm {
  title: string;
  description: string;
  material_type: string;
  weight_kg: number;
  location_name: string;
  price: number;
  is_free: boolean;
}

const itemTypes = [
  { value: "plastico", label: "Plástico" },
  { value: "carton", label: "Cartón" },
  { value: "vidrio", label: "Vidrio" },
  { value: "metal", label: "Metal" },
  { value: "papel", label: "Papel" },
  { value: "organico", label: "Orgánico" },
  { value: "textil", label: "Textil" },
  { value: "electronico", label: "Electrónico" },
  { value: "madera", label: "Madera" },
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

export default function PublishItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const { uploadMultipleImages, isUploading, uploadProgress } = useImageUpload();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ItemForm>({
    defaultValues: {
      is_free: false,
      price: 0
    }
  });

  const selectedType = watch("material_type");
  const isFree = watch("is_free");

  useEffect(() => {
    document.title = "Publicar Ítem | Circulapp";
    setMeta(
      "description",
      "Publica ítems reutilizables en tu comunidad y contribuye a la economía circular."
    );
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (selectedImages.length + files.length > 10) {
      toast({
        title: "Límite de imágenes",
        description: "Puedes subir máximo 10 imágenes por publicación",
        variant: "destructive"
      });
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Generate previews for new images
    const newPreviews = [...imagePreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data: ItemForm) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para publicar articulos",
        variant: "destructive"
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "Debes subir al menos una imagen",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Primero crear el ítem para obtener su ID
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          material_type: data.material_type,
          weight_kg: data.weight_kg,
          location_name: data.location_name,
          image_url: null, // Se actualizará después de subir las imágenes
          price: data.is_free ? 0 : data.price,
          is_free: data.is_free
        })
        .select()
        .single();

      if (itemError) {
        throw itemError;
      }

      // Subir las imágenes usando el ID del ítem
      const uploadResults = await uploadMultipleImages(selectedImages, itemData.id);
      
      if (uploadResults.length === 0) {
        throw new Error("No se pudieron subir las imágenes");
      }

      // Actualizar el ítem con la URL de la primera imagen
      const { error: updateError } = await supabase
        .from('items')
        .update({
          image_url: uploadResults[0].url
        })
        .eq('id', itemData.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "¡Ítem publicado!",
        description: `Tu ítem ha sido publicado exitosamente con ${uploadResults.length} imagen(es).`
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar el ítem",
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
          <h1 className="text-2xl font-bold tracking-tight">Publicar Ítem</h1>
          <p className="text-muted-foreground">
            Comparte ítems reutilizables con tu comunidad
          </p>
        </div>
      </section>

      {/* Form */}
      <section>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Información del Ítem</CardTitle>
            <CardDescription>
              Completa los detalles para que otros usuarios puedan encontrar tu ítem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Cartón corrugado limpio"
                  {...register("title", { required: "El título es obligatorio" })}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Precio */}
              <div className="space-y-3">
                <Label>Precio *</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_free"
                    checked={isFree}
                    onCheckedChange={(checked) => {
                      setValue("is_free", !!checked);
                      if (checked) setValue("price", 0);
                    }}
                  />
                  <Label htmlFor="is_free" className="text-sm font-normal">
                    Articulo gratuito
                  </Label>
                </div>
                
                {!isFree && (
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-10"
                      {...register("price", {
                        valueAsNumber: true,
                        min: { value: 0, message: "El precio debe ser mayor o igual a 0" }
                      })}
                    />
                  </div>
                )}
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              {/* Peso estimado */}
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

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="material_type">Categoría *</Label>
                <Select onValueChange={(value) => setValue("material_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la categoría del ítem" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.material_type && (
                  <p className="text-sm text-destructive">Selecciona una categoría</p>
                )}
              </div>

              {/* Ubicación */}
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

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el estado del ítem, condiciones de retiro, etc."
                  rows={4}
                  {...register("description", { required: "La descripción es obligatoria" })}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Fotos del artículo */}
              <div className="space-y-3">
                <Label htmlFor="images">Fotos del artículo *</Label>
                <div className="space-y-4">
                  {/* Image previews grid */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                            disabled={isUploading || isSubmitting}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Progress bar during upload */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Subiendo imágenes... {Math.round(uploadProgress)}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Upload area */}
                  {selectedImages.length < 10 && !isUploading && (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <div className="space-y-4">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div>
                          <Button type="button" variant="outline" asChild>
                            <label htmlFor="images" className="cursor-pointer">
                              {selectedImages.length === 0 ? "Seleccionar imágenes" : "Agregar más imágenes"}
                            </label>
                          </Button>
                          <input
                            id="images"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageSelect}
                            disabled={isSubmitting}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG, WebP, GIF hasta 5MB cada una. Máximo 10 imágenes.
                          {selectedImages.length > 0 && ` (${selectedImages.length}/10)`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedImages.length === 0 && !isUploading && (
                    <p className="text-sm text-destructive">Debes subir al menos una imagen</p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || selectedImages.length === 0}
                >
                  {isSubmitting ? "Publicando..." : "Publicar Ítem"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
