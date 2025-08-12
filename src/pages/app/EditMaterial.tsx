import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const materialTypes = [
  { value: "plastico-pet", label: "Plástico PET" },
  { value: "carton", label: "Cartón" },
  { value: "vidrio", label: "Vidrio" },
  { value: "aluminio", label: "Aluminio" },
  { value: "metal", label: "Metal" },
  { value: "papel", label: "Papel" },
  { value: "otro", label: "Otro" }
];

export default function EditMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    weight_kg: "",
    material_type: "",
    location_name: "",
    description: "",
    is_free: false
  });

  useEffect(() => {
    if (id) {
      fetchMaterial();
    }
  }, [id, user]);

  const fetchMaterial = async () => {
    if (!user || !id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el material",
          variant: "destructive"
        });
        navigate('/app/perfil');
        return;
      }

      setFormData({
        title: data.title || "",
        price: data.price?.toString() || "",
        weight_kg: data.weight_kg?.toString() || "",
        material_type: data.material_type || "",
        location_name: data.location_name || "",
        description: data.description || "",
        is_free: data.is_free || false
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar el material",
        variant: "destructive"
      });
      navigate('/app/perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    if (!formData.title || !formData.weight_kg || !formData.material_type || !formData.location_name) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('materials')
        .update({
          title: formData.title,
          price: formData.is_free ? 0 : parseFloat(formData.price) || 0,
          weight_kg: parseFloat(formData.weight_kg),
          material_type: formData.material_type,
          location_name: formData.location_name,
          description: formData.description,
          is_free: formData.is_free,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Material actualizado correctamente"
      });
      
      navigate('/app/perfil');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el material",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !id) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Material eliminado",
        description: "El material ha sido eliminado correctamente"
      });
      
      navigate('/app/perfil');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el material",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/perfil')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Editar Material</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Información del Material</CardTitle>
              <CardDescription>
                Actualiza la información de tu material publicado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Cartón de mudanza"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight_kg">Peso estimado (kg) *</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    placeholder="0.0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material_type">Categoría *</Label>
                  <Select
                    value={formData.material_type}
                    onValueChange={(value) => setFormData({ ...formData, material_type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_name">Ubicación *</Label>
                <Input
                  id="location_name"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="Ej: Villa Crespo, CABA"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_free"
                    checked={formData.is_free}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked as boolean })}
                  />
                  <Label htmlFor="is_free">Material gratuito</Label>
                </div>
              </div>

              {!formData.is_free && (
                <div className="space-y-2">
                  <Label htmlFor="price">Precio ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el estado y características del material..."
                  rows={4}
                />
              </div>

              <div className="flex justify-between pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" type="button">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar material?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. El material será eliminado permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? "Eliminando..." : "Eliminar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}