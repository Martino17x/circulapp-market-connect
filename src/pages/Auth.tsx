import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Link, Navigate } from "react-router-dom";
import { Leaf, Mail, Lock, User, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import signinIllustration from "@/assets/circulapp/signin-illustration.jpg";
import googleLogo from "@/assets/brands/google.svg";
import facebookLogo from "@/assets/brands/facebook.svg";

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

export default function Auth() {
  const { user, signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    document.title = "Acceder | Circulapp";
    setMeta(
      "description",
      "Únete a Circulapp: la comunidad de economía circular para reutilizar materiales domiciliarios."
    );
    ensureCanonical();
  }, []);

  // Redirect if already authenticated
  if (!loading && user) {
    return <Navigate to="/app" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message || "Verifica tus credenciales e intenta nuevamente",
      });
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, { username, full_name: fullName });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description: error.message || "Hubo un problema al crear tu cuenta",
      });
    } else {
      toast({
        title: "¡Cuenta creada!",
        description: "Revisa tu email para verificar tu cuenta y luego inicia sesión",
      });
      setCurrentView('signin');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa tu email",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al enviar el email de recuperación",
      });
    } else {
      setResetEmailSent(true);
    }
    setIsLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `No se pudo iniciar sesión con ${provider === 'google' ? 'Google' : 'Facebook'}`,
      });
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Leaf className="w-8 h-8 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      <main className="flex items-center justify-center p-6 lg:p-10">
        <article className="w-full max-w-md space-y-6">
          <header className="space-y-2 text-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2">
              <div className="h-10 w-10 rounded-md bg-primary/10 grid place-items-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-semibold">Circulapp</span>
            </Link>
            {currentView === 'signin' && (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">¡Bienvenido/a de vuelta!</h1>
                <p className="text-sm text-muted-foreground">
                  Ingresa a tu cuenta para continuar colaborando en la economía circular.
                </p>
              </>
            )}
            {currentView === 'signup' && (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Únete a Circulapp</h1>
                <p className="text-sm text-muted-foreground">
                  Crea tu cuenta y comienza a compartir materiales con tu comunidad.
                </p>
              </>
            )}
            {currentView === 'forgot' && (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
                <p className="text-sm text-muted-foreground">
                  Te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </>
            )}
          </header>

          {/* Vista de inicio de sesión */}
          {currentView === 'signin' && (
            <div className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      id="signin-email"
                      type="email" 
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Contraseña</Label>
                    <button
                      type="button"
                      onClick={() => setCurrentView('forgot')}
                      className="text-sm text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      id="signin-password"
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">También podés iniciar sesión con tus redes sociales</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  <img src={googleLogo} alt="Google" className="h-5 w-5" loading="lazy" />
                  Google
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={isLoading}
                >
                  <img src={facebookLogo} alt="Facebook" className="h-5 w-5" loading="lazy" />
                  Facebook
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  ¿No tenés cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentView('signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Registrate aquí
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Vista de registro */}
          {currentView === 'signup' && (
            <div className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Nombre completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      id="signup-fullname"
                      type="text" 
                      placeholder="Tu nombre completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-username">Nombre de usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      id="signup-username"
                      type="text" 
                      placeholder="usuario123"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      id="signup-email"
                      type="email" 
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Contraseña *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      id="signup-password"
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  * Campos obligatorios
                </p>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Al registrarte aceptas nuestras políticas comunitarias y de uso responsable.
                </p>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">También podés registrarte con tus redes sociales</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  <img src={googleLogo} alt="Google" className="h-5 w-5" loading="lazy" />
                  Google
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={isLoading}
                >
                  <img src={facebookLogo} alt="Facebook" className="h-5 w-5" loading="lazy" />
                  Facebook
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  ¿Ya tenés cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentView('signin')}
                    className="text-primary hover:underline font-medium"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Vista de recuperación de contraseña */}
          {currentView === 'forgot' && (
            <div className="space-y-4">
              {!resetEmailSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        id="forgot-email"
                        type="email" 
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">¡Email enviado!</h3>
                    <p className="text-sm text-muted-foreground">
                      Si tu email está registrado, te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('signin');
                    setResetEmailSent(false);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a iniciar sesión
                </button>
              </div>
            </div>
          )}
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
              <footer className="mt-2 text-sm text-muted-foreground">
                Economía circular, a escala de barrio.
              </footer>
            </blockquote>
          </div>
        </div>
      </aside>
    </div>
  );
}