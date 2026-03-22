import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import LandingPageNew from "./pages/LandingPageNew";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import StudyPlanner from "./pages/StudyPlanner";
import Practice from "./pages/Practice";
import Revision from "./pages/Revision";
import Analytics from "./pages/Analytics";
import AISolver from "./pages/AISolver";
import Notes from "./pages/Notes";
import Gamification from "./pages/Gamification";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import OnePager from "./pages/OnePager";
import Interview from "./pages/Interview";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPageNew />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/planner" element={<AppLayout><StudyPlanner /></AppLayout>} />
            <Route path="/practice" element={<AppLayout><Practice /></AppLayout>} />
            <Route path="/revision" element={<AppLayout><Revision /></AppLayout>} />
            <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
            <Route path="/ai-solver" element={<AppLayout><AISolver /></AppLayout>} />
            <Route path="/one-pager" element={<AppLayout><OnePager /></AppLayout>} />
            <Route path="/interview" element={<AppLayout><Interview /></AppLayout>} />
            <Route path="/notes" element={<AppLayout><Notes /></AppLayout>} />
            <Route path="/gamification" element={<AppLayout><Gamification /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
