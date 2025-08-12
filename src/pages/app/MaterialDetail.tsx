import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  MapPin, 
  Scale, 
  Calendar, 
  MessageCircle, 
  User,
  Share,
  Flag
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface MaterialData {
  id: string;
  title: string;
  description: string;
  material_type: string;
  weight_kg: number;
  location_name: string;
  image_url: string;
  created_at: string;
  user_id: string;
  status: string;
}

const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function MaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<MaterialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchMaterial();
    }
  }, [id]);

  useEffect(() => {
    if (material) {
      document.title = `${material.title} | Circulapp`;
      setMeta("description", `${material.description || `Material ${material.material_type}`} - ${material.location_name}`);
    }
  }, [material]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el material",
          variant: "destructive"
        });
        navigate('/app/marketplace');
        return;
      }

      setMaterial(data);
      
      // Fetch user profile if different from current user
      if (data.user_id !== user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('user_id', data.user_id)
          .single();
        
        setUserProfile(profile);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar el material",
        variant: "destructive"
      });
      navigate('/app/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    toast({
      title: "Chat",
      description: "Pronto podrás contactar por chat al oferente."
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: material?.title,
          text: `Mira este material en Circulapp: ${material?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace se ha copiado al portapapeles"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Material no encontrado</h3>
        <p className="text-muted-foreground mb-4">
          El material que buscas no existe o ha sido eliminado.
        </p>
        <Button asChild>
          <Link to="/app/marketplace">Volver al Marketplace</Link>
        </Button>
      </div>
    );
  }

  const isOwner = material.user_id === user?.id;
  const defaultImage = `/src/assets/circulapp/${material.material_type}.jpg`;

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{material.title}</h1>
            <p className="text-muted-foreground">
              Publicado el {formatDate(material.created_at)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image */}
        <section>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border">
            <img
              src={material.image_url || defaultImage}
              alt={material.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultImage;
              }}
            />
          </div>
        </section>

        {/* Material Details */}
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    {material.title}
                    <Badge variant="secondary">{material.material_type}</Badge>
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Scale className="h-4 w-4" />
                      {material.weight_kg} kg
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {material.location_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(material.created_at)}
                    </span>
                  </div>
                </div>
                <Badge variant={material.status === 'disponible' ? 'default' : 'secondary'}>
                  {material.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {material.description && (
                <div>
                  <h3 className="font-medium mb-2">Descripción</h3>
                  <p className="text-muted-foreground">{material.description}</p>
                </div>
              )}

              <Separator />

              {/* User info */}
              <div className="space-y-3">
                <h3 className="font-medium">Publicado por</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userProfile?.avatar_url} />
                    <AvatarFallback>
                      {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {userProfile?.full_name || userProfile?.username || 'Usuario'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Miembro de Circulapp
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action buttons */}
              <div className="space-y-3">
                {!isOwner && material.status === 'disponible' && (
                  <Button 
                    onClick={handleContact} 
                    className="w-full"
                    size="lg"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contactar oferente
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleShare} className="flex-1">
                    <Share className="mr-2 h-4 w-4" />
                    Compartir
                  </Button>
                  {!isOwner && (
                    <Button variant="outline" size="icon">
                      <Flag className="h-4 w-4" />
                    </Button>
                  )}
                  {isOwner && (
                    <Button variant="outline" asChild className="flex-1">
                      <Link to={`/app/material/${material.id}/edit`}>
                        Editar
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}