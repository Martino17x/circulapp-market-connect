import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [askInstall, setAskInstall] = useState(true);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // Check if running as PWA (iOS Safari)
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay if not installed
      if (!isInstalled) {
        setTimeout(() => {
          setShowPrompt(true);
          setAskInstall(true);
        }, 3000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setAskInstall(true);
    // Reactivar el cartel después de 20 minutos
    setTimeout(() => {
      setShowPrompt(true);
      setAskInstall(true);
    }, 20 * 60 * 1000);
  };

  // Don't show if already installed
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <Card className="w-80 shadow-lg border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Download className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-sm">Instala nuestra app</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {askInstall ? (
            <div className="flex flex-col gap-2 items-center">
              <p className="text-xs text-muted-foreground mb-2">¿Quieres instalar nuestra app?</p>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 text-xs" onClick={() => setAskInstall(false)}>
                  Sí
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleDismiss}>
                  No
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                Accede más rápido y funciona sin conexión
              </p>
              <div className="flex gap-2 mb-2">
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="flex-1 h-8 text-xs"
                >
                  Instalar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 text-xs"
                >
                  Ahora no
                </Button>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 text-xs text-muted-foreground">
                <strong>Importante:</strong> Por favor, inicia sesión antes de instalar la aplicación para disfrutar de todas las funcionalidades.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
