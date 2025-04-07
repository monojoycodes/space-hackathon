import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SpaceCargoProvider } from "./contexts/SpaceCargoContext";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Items } from './components/Items';

import SpaceLoading from "./components/SpaceLoading";
import SpaceBackground from "./components/SpaceBackground";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CargoPlacement from "./pages/CargoPlacement";
import ItemSearch from "./pages/ItemSearch";
import Rearrangement from "./pages/Rearrangement";
import WasteManagement from "./pages/WasteManagement";
import TimeSimulation from "./pages/TimeSimulation";
import Logs from "./pages/Logs";
import NotFound from "./pages/NotFound";

// Add styles for improved text visibility
import "./styles/theme.css";

const queryClient = new QueryClient();

// Animated wrapper for route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="cargo-placement" element={<CargoPlacement />} />
            <Route path="item-search" element={<ItemSearch />} />
            <Route path="rearrangement" element={<Rearrangement />} />
            <Route path="waste-management" element={<WasteManagement />} />
            <Route path="time-simulation" element={<TimeSimulation />} />
            <Route path="logs" element={<Logs />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SpaceCargoProvider>
          <Toaster />
          <Sonner />
          {isLoading ? <SpaceLoading timeout={3500} /> : (
            <>
              <SpaceBackground />
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </>
          )}
          <Items />
        </SpaceCargoProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
