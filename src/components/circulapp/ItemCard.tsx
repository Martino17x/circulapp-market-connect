import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Scale, User, MessageCircle, Eye, DollarSign, Edit, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// El tipo de dato que viene de la base de datos
import { Database } from "@/integrations/supabase/types";
type DbItem = Database['public']['Tables']['items']['Row'];

// Extendemos el tipo de la BD con campos adicionales que calculamos o unimos
export interface Item extends DbItem {
  distanceKm?: number;
  userName?: string;
}

interface Props {
  item: Item;
  showEditButton?: boolean;
}

const ItemCard = ({ item, showEditButton = false }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleContactClick = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para contactar al vendedor",
        variant: "destructive"
      });
      return;
    }

    if (!item.user_id) {
      toast({
        title: "Error", 
        description: "No se pudo obtener la información del vendedor",
        variant: "destructive"
      });
      return;
    }

    if (user.id === item.user_id) {
      toast({
        title: "Información",
        description: "No puedes contactarte a ti mismo",
        variant: "default"
      });
      return;
    }

    try {
      const { data } = await (supabase as any).rpc('start_conversation_about_item', {
        other_user_id: item.user_id,
        item_id: item.id,
        initial_message: null
      });


      toast({
        title: "Chat iniciado",
        description: "Se ha abierto una conversación sobre este producto"
      });

      // Navegar al chat con la conversación específica
      navigate(`/app/chat?conversation=${data}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar la conversación",
        variant: "destructive"
      });
    }
  };

  const firstImage = item.image_urls && item.image_urls.length > 0 
    ? item.image_urls[0] 
    : '/placeholder.svg';

  return (
    <article className="group animate-fade-in">
      <Card className="h-full overflow-hidden hover-scale group-hover:shadow-md">
        {/* Imagen principal */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img
            src={firstImage}
            alt={item.title || 'Imagen del artículo'}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        
        <CardContent className="space-y-4 p-4">
          {/* Título */}
          <div>
            <h3 className="text-lg font-semibold leading-tight line-clamp-2">
              {item.title || 'Artículo sin título'}
            </h3>
          </div>

          {/* Información principal en grid */}
          <div className="space-y-3">
            {/* Categoría */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Categoría</span>
              <Badge variant="secondary" className="capitalize">{item.material_type}</Badge>
            </div>

            {/* Peso estimado */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Peso</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium">
                <Scale className="size-4" />
                {item.weight_kg || 0} kg
              </span>
            </div>

            {/* Precio */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Precio</span>
              <div className="inline-flex items-center gap-1 text-sm font-medium">
                {item.is_free ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Gratuito
                  </Badge>
                ) : (
                  <span className="inline-flex items-center gap-1 text-primary font-semibold">
                    <DollarSign className="size-4" />
                    {item.price || 0}
                  </span>
                )}
              </div>
            </div>

            {/* Ubicación */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ubicación</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium">
                <MapPin className="size-4" />
                {item.location_name}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2 pt-2 border-t">
            {showEditButton && user?.id === item.user_id ? (
              <Button variant="outline" className="flex-1" asChild>
                <Link to={`/app/item/${item.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="flex-1" asChild>
                <Link to={`/app/item/${item.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver más
                </Link>
              </Button>
            )}
            <Button
              variant="default"
              className="flex-1"
              onClick={handleContactClick}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contactar
            </Button>
          </div>
        </CardContent>
      </Card>
    </article>
  );
};

export default ItemCard;