import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { User } from '@supabase/supabase-js';

interface BrandHeaderProps {
  user: User | null;
}

const BrandHeader = ({ user }: BrandHeaderProps) => {
  return (
    <header className="bg-hero">
      <nav className="container mx-auto flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 hover-scale">
          <Leaf className="text-primary-foreground" />
          <span className="text-lg font-extrabold tracking-tight text-primary-foreground">Circulapp</span>
        </Link>
        <div className="flex items-center gap-4">
          {!user && (
            <Link to="/auth" className="story-link text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground">
              INICIAR SESION
            </Link>
          )}
          <Button
            asChild
            variant="secondary"
            className="hover-scale"
          >
            <Link to="/app">
              Acceder al panel
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default BrandHeader;