import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin } from "lucide-react";

interface MessageItemReferenceProps {
  item: {
    id: string;
    title: string;
    material_type: string;
    image_url: string | null;
  };
}

export default function MessageItemReference({ item }: MessageItemReferenceProps) {
  return (
    <Card className="mt-2 max-w-sm bg-muted/50 border-muted">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2 mb-1">
              {item.title}
            </h4>
            <Badge variant="secondary" className="text-xs capitalize">
              {item.material_type}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
