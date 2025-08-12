import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Recycle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data para el dashboard
const stats = [
  {
    title: "Materiales publicados",
    value: "12",
    description: "En los últimos 30 días",
    icon: Plus,
    trend: "+15%"
  },
  {
    title: "Materiales reutilizados",
    value: "8",
    description: "Impacto positivo",
    icon: Recycle,
    trend: "+25%"
  },
  {
    title: "Conexiones activas",
    value: "24",
    description: "Vecinos colaborando",
    icon: Users,
    trend: "+12%"
  },
  {
    title: "Radio de acción",
    value: "3.2 km",
    description: "Alcance promedio",
    icon: MapPin,
    trend: "+5%"
  }
];

const recentActivities = [
  {
    id: 1,
    type: "material_added",
    title: "Publicaste cartón",
    description: "25kg de cartón corrugado",
    time: "Hace 2 horas",
    status: "active"
  },
  {
    id: 2,
    type: "material_requested",
    title: "Solicitud de Luis",
    description: "Interesado en tu plástico PET",
    time: "Hace 4 horas",
    status: "pending"
  },
  {
    id: 3,
    type: "material_collected",
    title: "Material recolectado",
    description: "Vidrio entregado a María",
    time: "Ayer",
    status: "completed"
  },
  {
    id: 4,
    type: "chat_message",
    title: "Nuevo mensaje",
    description: "Pedro pregunta sobre disponibilidad",
    time: "Ayer",
    status: "active"
  }
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

export default function Dashboard() {
  useEffect(() => {
    document.title = "Inicio | Circulapp";
    setMeta(
      "description",
      "Panel de control de Circulapp: gestiona tus materiales, conexiones y actividad en la economía circular."
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <section>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">¡Hola, Ana!</h1>
            <p className="text-muted-foreground">
              Tu impacto en la economía circular está creciendo. Aquí está tu actividad reciente.
            </p>
          </div>
          <Button asChild className="w-fit">
            <Link to="/app/publicar">
              <Plus className="mr-2 h-4 w-4" />
              Publicar material
            </Link>
          </Button>
        </div>
      </section>

      {/* Estadísticas */}
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Actividad reciente */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>
              Un resumen de tus últimas interacciones en Circulapp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.status === 'active' ? 'bg-primary' :
                    activity.status === 'pending' ? 'bg-accent' : 'bg-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none mb-1">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      activity.status === 'active' ? 'default' :
                      activity.status === 'pending' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {activity.status === 'active' ? 'Activo' :
                     activity.status === 'pending' ? 'Pendiente' : 'Completado'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Accesos rápidos */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
            <CardDescription>
              Herramientas principales para gestionar tu actividad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link to="/app/buscar">
                  <div className="text-left">
                    <div className="font-medium">Explorar materiales</div>
                    <div className="text-xs text-muted-foreground">Buscar en tu zona</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link to="/app/mapa">
                  <div className="text-left">
                    <div className="font-medium">Ver mapa</div>
                    <div className="text-xs text-muted-foreground">Ubicaciones cercanas</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 justify-start">
                <Link to="/app/chat">
                  <div className="text-left">
                    <div className="font-medium">Mensajes</div>
                    <div className="text-xs text-muted-foreground">2 conversaciones</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}