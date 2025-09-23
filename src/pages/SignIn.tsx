import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import signinIllustration from "@/assets/circulapp/signin-illustration.jpg";
import googleLogo from "@/assets/brands/google.svg";
import facebookLogo from "@/assets/brands/facebook.svg";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Provider } from "@supabase/supabase-js";

const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const ensureCanonical = () => {
  const href = window.location.href;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

export default function SignIn() {
  useEffect(() => {
    document.title = "Iniciar sesión | Circulapp";
    setMeta(
      "description",
      "Accede a Circulapp: la comunidad de economía circular para reutilizar materiales domiciliarios."
    );
    ensureCanonical();
  }, []);

  const handleOAuthSignIn = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });
    if (error) {
      console.error("Error during OAuth sign-in:", error);
      // Aquí podrías mostrar una notificación al usuario
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      <main className="flex items-center justify-center p-6 lg:p-10">
        <article className="w-full max-w-md space-y-6">
          <header className="space-y-2 text-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2">
              <div className="h-10 w-10 rounded-md bg-primary/10 grid place-items-center">
                <span className="text-primary font-bold">C</span>
              </div>
              <span className="text-xl font-semibold">Circulapp</span>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground">
              Bienvenido/a a la comunidad. Reutiliza, colabora y comparte.
            </p>
          </header>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-labelledby="signin-title">
            <div className="space-y-2">
              <Label htmlFor="email">Email o usuario</Label>
              <Input id="email" name="email" type="text" autoComplete="username" placeholder="tuname@email.com" required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link to="#" className="text-sm text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>

            <Button type="submit" className="w-full">Ingresar</Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">o continúa con</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="w-full" onClick={() => handleOAuthSignIn('google')}>
                <img src={googleLogo} alt="Google" className="h-5 w-5 mr-2" loading="lazy" />
                Google
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => handleOAuthSignIn('facebook')}>
                <img src={facebookLogo} alt="Facebook" className="h-5 w-5 mr-2" loading="lazy" />
                Facebook
              </Button>
            </div>

            <p className="px-8 text-center text-sm text-muted-foreground">
              Al hacer clic en continuar, aceptas nuestros{" "}
              <Link
                to="/terms-of-service"
                className="underline underline-offset-4 hover:text-primary"
              >
                Términos de Servicio
              </Link>{" "}
              y nuestra{" "}
              <Link
                to="/privacy-policy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Política de Privacidad
              </Link>
              .
            </p>
          </form>
        </article>
      </main>

      <aside className="hidden lg:flex items-stretch surface-subtle">
        <div className="relative w-full overflow-hidden rounded-l-2xl lg:rounded-l-none">
          <img
            src={signinIllustration}
            alt="Vecinos colaborando en la reutilización de materiales en Circulapp"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <blockquote className="max-w-xl text-foreground/90">
              <p className="text-lg font-medium">
                "Cada envase tiene más de una vida. En Circulapp, darle una segunda oportunidad es un esfuerzo en comunidad."
              </p>
              <footer className="mt-2 text-sm text-muted-foreground">Economía circular, a escala de barrio.</footer>
            </blockquote>
          </div>
        </div>
      </aside>
    </div>
  );
}
