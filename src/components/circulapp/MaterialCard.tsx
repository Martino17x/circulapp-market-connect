import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Scale, User, MessageCircle, Eye, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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
};

interface Props {
  material: Material;
}

const MaterialCard = ({ material }: Props) => {
  return (
    <article className="group animate-fade-in">
      <Card className="h-full overflow-hidden hover-scale group-hover:shadow-md">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={material.image}
            alt={`Material ${material.type} ofrecido por ${material.userName}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-base font-semibold leading-tight">{material.title || material.type}</h3>
              <p className="text-sm text-muted-foreground capitalize">{material.type}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Scale className="size-4" />
                  {material.weightKg} kg
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" />
                  {material.locationName}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="inline-flex items-center gap-1 text-sm font-medium">
                  {material.isFree ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Gratuito
                    </Badge>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <DollarSign className="size-4" />
                      ${material.price || 0}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {material.distanceKm.toFixed(1)} km
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">{material.userName}</Badge>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link to={`/app/material/${material.id}`}>
                <Eye /> Ver más
              </Link>
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() =>
                toast({ title: "Chat", description: "Pronto podrás contactar por chat al oferente." })
              }
            >
              <MessageCircle /> Contactar
            </Button>
          </div>
        </CardContent>
      </Card>
    </article>
  );
};

export default MaterialCard;
