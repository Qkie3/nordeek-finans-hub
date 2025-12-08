import { Toaster } from "@/components/ui/toaster";

import NewsListAI from './components/NewsListAI';
import SettingsToggle from './components/SettingsToggle';
import { Toaster as Sonner } from "@/components/ui/sonner";

import NewsListAI from './components/NewsListAI';
import SettingsToggle from './components/SettingsToggle';
import { TooltipProvider } from "@/components/ui/tooltip";

import NewsListAI from './components/NewsListAI';
import SettingsToggle from './components/SettingsToggle';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import NewsListAI from './components/NewsListAI';
import SettingsToggle from './components/SettingsToggle';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NewsListAI from './components/NewsListAI';
import SettingsToggle from './components/SettingsToggle';
import Index from "./pages/Index";

import NewsListAI from './components/NewsListAI';
import SettingsToggle from './components/SettingsToggle';
import NotFound from "./pages/NotFound";


import NewsListAI from './components/NewsListAI';
import SettingsToggle from './components/SettingsToggle';
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;



{/* Nordeek AI-News */}
<NewsListAI showFilters />

