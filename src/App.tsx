import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Logins from "./pages/Logins";
import Tasks from "./pages/Tasks";
import Routines from "./pages/Routines";
import Notes from "./pages/Notes";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import Security from "./pages/Security";
import Automation from "./pages/Automation";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import { AppProvider } from "@/contexts/AppContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/logins" element={<Logins />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/routines" element={<Routines />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/history" element={<History />} />
              <Route path="/security" element={<Security />} />
              <Route path="/automation" element={<Automation />} />
              <Route path="/calendar" element={<Calendar />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;