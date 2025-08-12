import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import AppLayout from "./components/circulapp/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import ComingSoon from "./pages/app/ComingSoon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ingresar" element={<SignIn />} />
          
          {/* App routes (authenticated) */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="publicar" element={<ComingSoon />} />
            <Route path="buscar" element={<ComingSoon />} />
            <Route path="mapa" element={<ComingSoon />} />
            <Route path="chat" element={<ComingSoon />} />
            <Route path="recoleccion" element={<ComingSoon />} />
            <Route path="perfil" element={<ComingSoon />} />
            <Route path="denuncias" element={<ComingSoon />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
