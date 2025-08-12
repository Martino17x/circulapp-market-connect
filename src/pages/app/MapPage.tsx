import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter, Grid3X3, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Mock data for materials on map
const mockMaterials = [
  {
    id: "1",
    type: "Plástico PET",
    weightKg: 2.5,
    locationName: "Villa Crespo",
    userName: "María González",
    image: "/placeholder.svg",
    coordinates: { lat: -34.5998, lng: -58.4302 },
    distance: "0.8 km"
  },
  {
    id: "2", 
    type: "Cartón",
    weightKg: 1.2,
    locationName: "Palermo",
    userName: "Carlos López",
    image: "/placeholder.svg",
    coordinates: { lat: -34.5875, lng: -58.4200 },
    distance: "1.2 km"
  },
  {
    id: "3",
    type: "Vidrio",
    weightKg: 3.0,
    locationName: "Belgrano",
    userName: "Ana Rodríguez",
    image: "/placeholder.svg",
    coordinates: { lat: -34.5625, lng: -58.4560 },
    distance: "2.1 km"
  },
  {
    id: "4",
    type: "Aluminio",
    weightKg: 0.8,
    locationName: "Caballito",
    userName: "Diego Martín",
    image: "/placeholder.svg",
    coordinates: { lat: -34.6220, lng: -58.4370 },
    distance: "1.5 km"
  }
];

const materialTypes = ["Todos", "Plástico PET", "Cartón", "Vidrio", "Aluminio", "Metal"];

const MapPage = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredMaterials = mockMaterials.filter(material => {
    const matchesSearch = material.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "Todos" || material.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleMarkerClick = (material: any) => {
    setSelectedMaterial(material);
  };

  const handleViewDetails = (materialId: string) => {
    navigate(`/app/buscar/material/${materialId}`);
  };

  const handleContact = (userName: string) => {
    toast({
      title: "Contactar usuario",
      description: `Próximamente podrás chatear con ${userName}`,
    });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: "Ubicación obtenida",
            description: "Mostrando materiales cerca de tu ubicación",
          });
        },
        () => {
          toast({
            title: "Error",
            description: "No se pudo obtener tu ubicación",
            variant: "destructive",
          });
        }
      );
    }
  };

  const getMaterialIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      "Plástico PET": "🥤",
      "Cartón": "📦", 
      "Vidrio": "🍾",
      "Aluminio": "🥫",
      "Metal": "🔧"
    };
    return iconMap[type] || "♻️";
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header with search and filters */}
      <div className="border-b bg-background p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Mapa de Materiales</h1>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {filteredMaterials.length} disponibles
            </Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="flex gap-2 flex-1 lg:flex-initial">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por barrio o usuario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {materialTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                className="whitespace-nowrap"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Mi ubicación
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/app/buscar")}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Vista tarjetas
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map container */}
        <div className="flex-1 relative bg-muted/20">
          {/* Simulated map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
          </div>

          {/* Map markers */}
          {filteredMaterials.map((material, index) => (
            <div
              key={material.id}
              className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10 hover:z-20"
              style={{
                left: `${20 + (index * 15)}%`,
                top: `${30 + (index * 10)}%`,
              }}
              onClick={() => handleMarkerClick(material)}
            >
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center text-lg shadow-lg hover:scale-110 transition-transform">
                {getMaterialIcon(material.type)}
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" />
            </div>
          ))}

          {/* Map attribution */}
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Mapa interactivo de Circulapp
          </div>
        </div>

        {/* Material detail popup */}
        {selectedMaterial && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-80 max-w-[90vw]">
            <Card className="shadow-lg border">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{selectedMaterial.type}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMaterial(null)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="flex gap-3 mb-3">
                  <img
                    src={selectedMaterial.image}
                    alt={selectedMaterial.type}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>{selectedMaterial.weightKg} kg</strong>
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {selectedMaterial.locationName} ({selectedMaterial.distance})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Por: {selectedMaterial.userName}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleViewDetails(selectedMaterial.id)}
                    className="flex-1"
                  >
                    Ver detalles
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContact(selectedMaterial.userName)}
                    className="flex-1"
                  >
                    Contactar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Backdrop for mobile popup */}
        {selectedMaterial && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setSelectedMaterial(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MapPage;