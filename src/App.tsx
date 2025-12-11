import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AntiPhishing from "./pages/AntiPhishing";
import DeepfakeScanner from "./pages/DeepfakeScanner";
import AntiRansomware from "./pages/AntiRansomware";
import ThreatMonitor from "./pages/ThreatMonitor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/anti-phishing" element={<AntiPhishing />} />
          <Route path="/deepfake-scanner" element={<DeepfakeScanner />} />
          <Route path="/anti-ransomware" element={<AntiRansomware />} />
          <Route path="/threat-monitor" element={<ThreatMonitor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
