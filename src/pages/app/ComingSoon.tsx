import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const pageInfo: Record<string, { title: string; description: string }> = {
  "/app/publicar": {
    title: "Publicar material",
    description: "Pronto podrás añadir nuevos materiales al marketplace con fotos, peso, ubicación y descripción."
  },
  "/app/buscar": {
    title: "Buscar materiales",
    description: "La búsqueda avanzada estará disponible próximamente con filtros por tipo, distancia y disponibilidad."
  },
  "/app/mapa": {
    title: "Mapa interactivo",
    description: "Visualiza ubicaciones de materiales en un mapa con geolocalización y rutas optimizadas."
  },
  "/app/chat": {
    title: "Sistema de chat",
    description: "Conecta directamente con otros usuarios para coordinar intercambios y recolecciones."
  },
  "/app/recoleccion": {
    title: "Gestión de recolecciones",
    description: "Organiza y programa recolecciones masivas con otros miembros de la comunidad."
  },
  "/app/perfil": {
    title: "Mi perfil",
    description: "Personaliza tu perfil, configuraciones de privacidad y preferencias de notificación."
  },
  "/app/denuncias": {
    title: "Sistema de denuncias",
    description: "Reporta contenido inapropiado o usuarios que no cumplan las normas comunitarias."
  }
};

export default function ComingSoon() {
  const location = useLocation();
  const currentPage = pageInfo[location.pathname] || {
    title: "Funcionalidad",
    description: "Esta sección estará disponible próximamente."
  };

  useEffect(() => {
    document.title = `${currentPage.title} | Circulapp`;
  }, [currentPage.title]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Construction className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">{currentPage.title}</CardTitle>
          <CardDescription className="text-center">
            {currentPage.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Estamos trabajando para traerte esta funcionalidad pronto. Mientras tanto, 
            puedes explorar las demás secciones disponibles.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/app">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}