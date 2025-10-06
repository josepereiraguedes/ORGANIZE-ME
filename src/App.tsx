import { useState, useEffect } from 'react';
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
import { FirstTimeLogin } from "@/components/FirstTimeLogin";
import { Shield } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [userTheme, setUserTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Verificar se é a primeira vez que o usuário acessa
    const hasVisited = localStorage.getItem('hasVisited');
    const savedTheme = localStorage.getItem('userTheme') as 'light' | 'dark';
    
    if (hasVisited) {
      setIsFirstTime(false);
      // Aplicar tema salvo
      if (savedTheme) {
        setUserTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
      } else {
        // Usar tema do sistema se não houver tema salvo
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setUserTheme(systemTheme);
        document.documentElement.classList.toggle("dark", systemTheme === "dark");
      }
    } else {
      setIsFirstTime(true);
    }
  }, []);

  const handleLoginComplete = (userName: string, theme: 'light' | 'dark') => {
    // Marcar que o usuário já visitou o app
    localStorage.setItem('hasVisited', 'true');
    setIsFirstTime(false);
    setUserTheme(theme);
    // Aplicar o tema selecionado
    document.documentElement.classList.toggle("dark", theme === "dark");
  };

  // Mostrar loading enquanto verifica se é a primeira vez
  if (isFirstTime === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar tela de login se for a primeira vez
  if (isFirstTime) {
    return (
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <FirstTimeLogin onLoginComplete={handleLoginComplete} />
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </QueryClientProvider>
    );
  }

  // Mostrar app normalmente após o login
  return (
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
};

export default App;