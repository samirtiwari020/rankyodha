import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CourseProvider } from "@/contexts/CourseContext";
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
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <CourseProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPageNew />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup" element={<Signup />} />

              {/* Old routes - redirect to JEE by default */}
              <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/planner" element={<AppLayout><StudyPlanner /></AppLayout>} />
              <Route path="/practice" element={<AppLayout><Practice /></AppLayout>} />
              <Route path="/revision" element={<AppLayout><Revision /></AppLayout>} />
              <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
              <Route path="/ai-solver" element={<AppLayout><AISolver /></AppLayout>} />
              <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />

              {/* New course-based routes */}
              <Route path="/dashboard/:course" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/planner/:course" element={<AppLayout><StudyPlanner /></AppLayout>} />
              <Route path="/practice/:course" element={<AppLayout><Practice /></AppLayout>} />
              <Route path="/revision/:course" element={<AppLayout><Revision /></AppLayout>} />
              <Route path="/analytics/:course" element={<AppLayout><Analytics /></AppLayout>} />
              <Route path="/ai-solver/:course" element={<AppLayout><AISolver /></AppLayout>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </CourseProvider>
  </ThemeProvider>
);

export default App;
