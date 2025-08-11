import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const BrandHeader = () => {
  return (
    <header className="bg-hero">
      <nav className="container mx-auto flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 hover-scale">
          <Leaf className="text-primary-foreground" />
          <span className="text-lg font-extrabold tracking-tight text-primary-foreground">Circulapp</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/ingresar" className="story-link text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground">
            Iniciar sesión
          </Link>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "Pronto",
                description: "Publicación de materiales disponible en la siguiente versión",
              })
            }
            className="hover-scale"
          >
            Publicar material
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default BrandHeader;
