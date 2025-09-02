import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/circulapp/ProtectedRoute";
import PWAInstallPrompt from "@/components/circulapp/PWAInstallPrompt";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AppLayout from "./components/circulapp/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import ComingSoon from "./pages/app/ComingSoon";
import Profile from "./pages/app/Profile";
import MapPage from "./pages/app/MapPage";
import Marketplace from "./pages/app/Marketplace";
import PublishItem from "./pages/app/PublishItem";
import UserProfile from "./pages/app/UserProfile";
import ItemDetail from "./pages/app/ItemDetail";
import EditItem from "./pages/app/EditItem";
import ChatPage from "./pages/app/ChatPage";

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
              <Route path="publicar" element={<PublishItem />} />
              <Route path="buscar" element={<Marketplace />} />
              <Route path="mapa" element={<MapPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="recoleccion" element={<ComingSoon />} />
              <Route path="item/:id" element={<ItemDetail />} />
              <Route path="item/:id/edit" element={<EditItem />} />
              <Route path="perfil" element={<UserProfile />} />
              <Route path="denuncias" element={<ComingSoon />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PWAInstallPrompt />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;