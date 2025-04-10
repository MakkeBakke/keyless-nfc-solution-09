
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PinSecurityProvider } from "./contexts/PinSecurityContext";
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
import Navigation from "./components/Navigation";
import { useIsMobile } from "./hooks/use-mobile";

// Configure React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000, // 1 minute stale time to reduce unnecessary refetches
      gcTime: 300000, // 5 minutes garbage collection time (formerly cacheTime)
    },
  },
});

// Wrapper component to handle route animations, global header and navigation
const AnimatedRoutes = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  // Only show padding bottom when not on home page or when logged in
  const paddingClass = !isHome ? "pb-16" : "";
  
  return (
    <>
      <div className={paddingClass}>
        <AnimatePresence mode="wait" initial={false}>
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
        <PinSecurityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" closeButton />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </PinSecurityProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
