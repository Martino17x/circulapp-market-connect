import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const BrandHeader = () => {
  return (
    <header className="bg-hero">
      <nav className="container mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Leaf className="text-primary" />
          <span className="text-lg font-extrabold tracking-tight">Circulapp</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="hero"
            onClick={() =>
              toast({
                title: "Pronto",
                description: "Publicación de materiales disponible en la siguiente versión",
              })
            }
          >
            Publicar material
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default BrandHeader;
