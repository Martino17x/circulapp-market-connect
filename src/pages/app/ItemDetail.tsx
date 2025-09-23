import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { 
  ArrowLeft, 
  MapPin, 
  Scale, 
  Calendar, 
  MessageCircle, 
  Share,
  Flag,
  Edit
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Item } from "@/components/circulapp/ItemCard"; // Usamos el tipo unificado

const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  useEffect(() => {
    if (item) {
      document.title = `${item.title} | Circulapp`;
      setMeta("description", `${item.description || `Ítem ${item.material_type}`} - ${item.location_name}`);
    }
  }, [item]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "No se pudo cargar el ítem o no fue encontrado.",
          variant: "destructive"
        });
        navigate('/app/marketplace');
        return;
      }
      
      const formattedItem: Item = {
        ...data,
        userName: (data.user as any)?.full_name || (data.user as any)?.username || 'Anónimo'
      };

      setItem(formattedItem);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al cargar el ítem",
        variant: "destructive"
      });
      navigate('/app/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!user) return toast({ title: "Debes iniciar sesión", variant: "destructive"});
    if (!item || !item.user_id) return toast({ title: "Error", description: "No se encontró el vendedor", variant: "destructive"});
    if (item.user_id === user.id) return toast({ title: "No puedes contactarte a ti mismo"});

    try {
      const { data: conversationId } = await (supabase as any).rpc('start_conversation_about_item', {
        other_user_id: item.user_id,
        item_id: item.id,
      });
      navigate(`/app/chat?conversation=${conversationId}`);
    } catch (error: any) {
      toast({ title: "Error al iniciar chat", description: error.message, variant: "destructive"});
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.title,
          text: `Mira este articulo en Circulapp: ${item?.title}`,
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

  if (!item) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Artículo no encontrado</h3>
        <p className="text-muted-foreground mb-4">
          El artículo que buscas no existe o ha sido eliminado.
        </p>
        <Button asChild>
          <Link to="/app/marketplace">Volver al Marketplace</Link>
        </Button>
      </div>
    );
  }

  const isOwner = item.user_id === user?.id;
  const images = item.image_urls && item.image_urls.length > 0 ? item.image_urls : ['/placeholder.svg'];

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
            <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
            <p className="text-muted-foreground">
              Publicado el {formatDate(item.created_at)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Carousel */}
        <section>
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={img}
                      alt={`${item.title} - imagen ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-2" />
                <CarouselNext className="absolute right-2" />
              </>
            )}
          </Carousel>
        </section>

        {/* Item Details */}
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    {item.title}
                    <Badge variant="secondary">{item.material_type}</Badge>
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Scale className="h-4 w-4" />
                      {item.weight_kg} kg
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {item.location_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>
                <Badge variant={item.status === 'disponible' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.description && (
                <div>
                  <h3 className="font-medium mb-2">Descripción</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                </div>
              )}

              <Separator />

              {/* User info */}
              <div className="space-y-3">
                <h3 className="font-medium">Publicado por</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={(item.user as any)?.avatar_url} />
                    <AvatarFallback>
                      {item.userName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {item.userName}
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
                {!isOwner && item.status === 'disponible' && (
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
                      <Link to={`/app/item/${item.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
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
