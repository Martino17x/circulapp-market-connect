import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/circulapp/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AppLayout from "./components/circulapp/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import ComingSoon from "./pages/app/ComingSoon";
import Profile from "./pages/app/Profile";
import MapPage from "./pages/app/MapPage";
import Marketplace from "./pages/app/Marketplace";
import PublishMaterial from "./pages/app/PublishMaterial";
import UserProfile from "./pages/app/UserProfile";
import MaterialDetail from "./pages/app/MaterialDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<Auth />} />
            
            {/* App routes (authenticated) */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="publicar" element={<PublishMaterial />} />
              <Route path="buscar" element={<Marketplace />} />
              <Route path="mapa" element={<MapPage />} />
              <Route path="chat" element={<ComingSoon />} />
              <Route path="recoleccion" element={<ComingSoon />} />
              <Route path="material/:id" element={<MaterialDetail />} />
              <Route path="perfil" element={<UserProfile />} />
              <Route path="denuncias" element={<ComingSoon />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
