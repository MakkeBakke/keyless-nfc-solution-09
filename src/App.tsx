
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import KeyDetail from "./pages/KeyDetail";
import KeyPermissions from "./pages/KeyPermissions";
import KeySecurity from "./pages/KeySecurity";
import KeyNotifications from "./pages/KeyNotifications";
import PairDevice from "./pages/PairDevice";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Wrapper component to handle route animations, global header and navigation
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <>
      <Header title="Digital Keys" />
      <div className="pb-16"> {/* Add padding bottom to account for the navigation bar */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Index />} />
            <Route path="/key/:id" element={<KeyDetail />} />
            <Route path="/key/:id/permissions" element={<KeyPermissions />} />
            <Route path="/key/:id/security" element={<KeySecurity />} />
            <Route path="/key/:id/notifications" element={<KeyNotifications />} />
            <Route path="/pair" element={<PairDevice />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
      <Navigation />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
