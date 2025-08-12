import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Scale, User, MessageCircle, Eye, DollarSign, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export type Material = {
  id: string;
  type: string;
  weightKg: number;
  locationName: string;
  distanceKm: number;
  image: string;
  userName: string;
  status?: string;
  title?: string;
  price?: number;
  isFree?: boolean;
  user_id?: string;
};

interface Props {
  material: Material;
  showEditButton?: boolean;
}

const MaterialCard = ({ material, showEditButton = false }: Props) => {
  const { user } = useAuth();
  return (
    <article className="group animate-fade-in">
      <Card className="h-full overflow-hidden hover-scale group-hover:shadow-md">
        {/* Imagen principal */}
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={material.image}
            alt={`${material.title || material.type} - ${material.type}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        
        <CardContent className="space-y-4 p-4">
          {/* Título */}
          <div>
            <h3 className="text-lg font-semibold leading-tight line-clamp-2">
              {material.title || material.type}
            </h3>
          </div>

          {/* Información principal en grid */}
          <div className="space-y-3">
            {/* Categoría */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Categoría</span>
              <Badge variant="secondary" className="capitalize">{material.type}</Badge>
            </div>

            {/* Peso estimado */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Peso</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium">
                <Scale className="size-4" />
                {material.weightKg} kg
              </span>
            </div>

            {/* Precio */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Precio</span>
              <div className="inline-flex items-center gap-1 text-sm font-medium">
                {material.isFree ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Gratuito
                  </Badge>
                ) : (
                  <span className="inline-flex items-center gap-1 text-primary font-semibold">
                    <DollarSign className="size-4" />
                    {material.price || 0}
                  </span>
                )}
              </div>
            </div>

            {/* Ubicación */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ubicación</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium">
                <MapPin className="size-4" />
                {material.locationName}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2 pt-2 border-t">
            {showEditButton && user?.id === material.user_id ? (
              <Button variant="outline" className="flex-1" asChild>
                <Link to={`/app/material/${material.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="flex-1" asChild>
                <Link to={`/app/material/${material.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver más
                </Link>
              </Button>
            )}
            <Button
              variant="default"
              className="flex-1"
              onClick={() =>
                toast({ title: "Chat", description: "Pronto podrás contactar por chat al oferente." })
              }
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

export default MaterialCard;
