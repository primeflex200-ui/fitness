import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Diet from "./pages/Diet";
import Strength from "./pages/Strength";
import MindMuscle from "./pages/MindMuscle";
import Water from "./pages/Water";
import Videos from "./pages/Videos";
import Cardio from "./pages/Cardio";
import Steps from "./pages/Steps";
import Nutrition from "./pages/Nutrition";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import HeightGrowth from "./pages/HeightGrowth";
import FormDetector from "./pages/FormDetector";
import AdminPanel from "./pages/AdminPanel";
import Feedback from "./pages/Feedback";
import Community from "./pages/Community";
import HomeWorkout from "./pages/HomeWorkout";
import Calisthenics from "./pages/Calisthenics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/strength" element={<Strength />} />
            <Route path="/mindmuscle" element={<MindMuscle />} />
            <Route path="/water" element={<Water />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/cardio" element={<Cardio />} />
            <Route path="/steps" element={<Steps />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/height-growth" element={<HeightGrowth />} />
            <Route path="/form-detector" element={<FormDetector />} />
            <Route path="/home-workout" element={<HomeWorkout />} />
            <Route path="/calisthenics" element={<Calisthenics />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/community" element={<Community />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
