import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Leaf, Recycle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos de datos
interface CollectionEvent {
  id: number;
  title: string;
  date: string; // formato: "YYYY-MM-DD"
  time: string;
  description: string;
  status: "Disponible" | "Lleno" | "Próximamente";
  category: "Orgánicos" | "Plásticos" | "Papel" | "Vidrio" | "Electrónicos" | "General";
  location: string;
}

// Datos mock de eventos
const mockEvents: CollectionEvent[] = [
  {
    id: 1,
    title: "Recolección de Residuos Orgánicos",
    date: "2024-10-20",
    time: "09:00 AM",
    description: "Recolección especial de residuos orgánicos en el sector norte. Traer residuos en bolsas compostables.",
    status: "Disponible",
    category: "Orgánicos",
    location: "Plaza Central"
  },
  {
    id: 2,
    title: "Jornada de Reciclaje de Plásticos",
    date: "2024-10-20",
    time: "02:00 PM",
    description: "Reciclaje de todo tipo de plásticos PET, HDPE y PP. Se aceptan botellas, envases y contenedores limpios.",
    status: "Disponible",
    category: "Plásticos",
    location: "Centro Comunitario"
  },
  {
    id: 3,
    title: "Recolección de Papel y Cartón",
    date: "2024-10-25",
    time: "10:00 AM",
    description: "Recolección masiva de papel, cartón y materiales de oficina. Ideal para empresas y hogares.",
    status: "Disponible",
    category: "Papel",
    location: "Parque Municipal"
  },
  {
    id: 4,
    title: "Reciclaje de Vidrio",
    date: "2024-10-28",
    time: "11:00 AM",
    description: "Punto de recolección para botellas y envases de vidrio. Separar por colores si es posible.",
    status: "Lleno",
    category: "Vidrio",
    location: "Mercado Local"
  },
  {
    id: 5,
    title: "Recolección de Electrónicos",
    date: "2024-11-03",
    time: "09:00 AM",
    description: "Desecho responsable de equipos electrónicos, baterías y cables. No se aceptan electrodomésticos grandes.",
    status: "Disponible",
    category: "Electrónicos",
    location: "Centro Tecnológico"
  },
  {
    id: 6,
    title: "Limpieza Comunitaria General",
    date: "2024-11-10",
    time: "08:00 AM",
    description: "Jornada de limpieza y recolección general en espacios públicos. Traer guantes y bolsas.",
    status: "Próximamente",
    category: "General",
    location: "Varios puntos"
  },
  {
    id: 7,
    title: "Recolección de Orgánicos - Zona Sur",
    date: "2024-11-15",
    time: "10:00 AM",
    description: "Segunda jornada de recolección de residuos orgánicos para compostaje comunitario.",
    status: "Disponible",
    category: "Orgánicos",
    location: "Plaza Sur"
  },
  {
    id: 8,
    title: "Reciclaje de Plásticos - Edición Especial",
    date: "2024-11-20",
    time: "03:00 PM",
    description: "Evento especial con premios para quienes traigan mayor cantidad de plásticos reciclables.",
    status: "Próximamente",
    category: "Plásticos",
    location: "Estadio Municipal"
  }
];

// Iconos por categoría
const categoryIcons: Record<CollectionEvent["category"], typeof Leaf> = {
  "Orgánicos": Leaf,
  "Plásticos": Recycle,
  "Papel": CalendarIcon,
  "Vidrio": Trash2,
  "Electrónicos": CalendarIcon,
  "General": Trash2
};

// Colores por estado
const statusColors: Record<CollectionEvent["status"], string> = {
  "Disponible": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  "Lleno": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  "Próximamente": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
};

const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function CollectionPage() {
  console.log("🔵 CollectionPage - Componente montado");
  console.log("🔵 NUEVO COMPONENTE CARGADO - VERSIÓN 2.0");
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<CollectionEvent[]>(mockEvents);

  console.log("📅 Estado actual:", {
    currentDate,
    selectedDate,
    filteredEventsCount: filteredEvents.length,
    mockEventsCount: mockEvents.length
  });

  useEffect(() => {
    console.log("✅ useEffect - Configurando título y meta");
    document.title = "Recolección | Circulapp";
    setMeta("description", "Calendario de eventos de recolección y reciclaje comunitario");
  }, []);

  // Filtrar eventos cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      const dateStr = formatDateToString(selectedDate);
      const eventsForDate = mockEvents.filter(event => event.date === dateStr);
      setFilteredEvents(eventsForDate);
    } else {
      // Mostrar todos los eventos próximos ordenados por fecha
      const sortedEvents = [...mockEvents].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setFilteredEvents(sortedEvents);
    }
  }, [selectedDate]);

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasEventsOnDate = (date: Date): boolean => {
    const dateStr = formatDateToString(date);
    return mockEvents.some(event => event.date === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendario de Recolección</h1>
          <p className="text-muted-foreground">
            Consulta los eventos de recolección y reciclaje programados en tu comunidad
          </p>
        </div>
      </section>

      {/* Layout principal */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Calendario - Columna izquierda */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-2">
                {/* Días vacíos al inicio */}
                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {/* Días del mes */}
                {days.map((day) => {
                  const dateForDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const hasEvents = hasEventsOnDate(dateForDay);
                  const isTodayDate = isToday(day);
                  const isSelected = isSelectedDate(day);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "aspect-square rounded-lg border-2 transition-all hover:border-primary hover:bg-accent relative",
                        "flex flex-col items-center justify-center",
                        isTodayDate && "border-primary bg-primary/5",
                        isSelected && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                        !isSelected && !isTodayDate && "border-transparent"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium",
                        isSelected && "text-primary-foreground"
                      )}>
                        {day}
                      </span>
                      {hasEvents && (
                        <div className={cn(
                          "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                          isSelected ? "bg-primary-foreground" : "bg-primary"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Día con eventos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-lg border-2 border-primary" />
                  <span>Hoy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Lista de eventos - Columna derecha / Aside */}
        <section>
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedDate ? "Eventos del día" : "Próximos eventos"}
              </CardTitle>
              <CardDescription>
                {selectedDate
                  ? `${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}, ${selectedDate.getFullYear()}`
                  : "Todos los eventos programados"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    No hay eventos programados para esta fecha
                  </p>
                  {selectedDate && (
                    <Button
                      variant="link"
                      onClick={() => setSelectedDate(null)}
                      className="mt-2"
                    >
                      Ver todos los eventos
                    </Button>
                  )}
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const Icon = categoryIcons[event.category];
                  const eventDate = new Date(event.date + 'T00:00:00');
                  
                  return (
                    <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        {/* Header del evento */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="rounded-full bg-primary/10 p-2 shrink-0">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                                {event.title}
                              </h3>
                            </div>
                          </div>
                          <Badge className={cn("shrink-0", statusColors[event.status])}>
                            {event.status}
                          </Badge>
                        </div>

                        {/* Descripción */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>

                        {/* Información adicional */}
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {eventDate.getDate()} de {monthNames[eventDate.getMonth()]}, {eventDate.getFullYear()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        {/* Categoría */}
                        <div>
                          <Badge variant="secondary" className="text-xs">
                            {event.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
