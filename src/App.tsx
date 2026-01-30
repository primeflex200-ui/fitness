import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { WaterReminderProvider } from "./contexts/WaterReminderContext";
import { ThemeProvider } from "./components/theme-provider";
import { App as CapacitorApp } from '@capacitor/app';
// NotificationProvider removed - using system notifications only
import { CardioTimerProvider } from "./contexts/CardioTimerContext";
import SplashScreen from "./components/SplashScreen";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Diet from "./pages/Diet";
import Strength from "./pages/Strength";
import MindMuscle from "./pages/MindMuscle";
import Water from "./pages/Water";
import WorkoutVideos from "./pages/WorkoutVideos";
import Cardio from "./pages/Cardio";
import Steps from "./pages/Steps";
import Nutrition from "./pages/Nutrition";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import HeightGrowth from "./pages/HeightGrowth";
import FormDetector from "./pages/FormDetector";
import Feedback from "./pages/Feedback";
import Community from "./pages/Community";
import HomeWorkout from "./pages/HomeWorkout";
import Calisthenics from "./pages/Calisthenics";
import About from "./pages/About";
import AdminPanel from "./pages/AdminPanel";
import PrimeFlexFullSystem from "./pages/PrimeFlexFullSystem";
import SupabaseTestPage from "./pages/SupabaseTestPage.tsx";
import SupabaseTest from "./pages/SupabaseTest";
import BucketSetupPage from "./pages/BucketSetupPage";
import RLSDiagnosticsPage from "./pages/RLSDiagnosticsPage";
import DirectInsertTestPage from "./pages/DirectInsertTestPage";
import AuthDebugPage from "./pages/AuthDebugPage";
import VideoUploadPage from "./pages/VideoUploadPage";
import AIDietPlanGenerator from "./pages/AIDietPlanGenerator";
import DietPlanTracker from "./pages/DietPlanTracker";
import SavedDietPlans from "./pages/SavedDietPlans";
import BodyFatCalculator from "./pages/BodyFatCalculator";
import ComingSoon from "./pages/ComingSoon";
import WeeklySchedule from "./pages/WeeklySchedule";
import { ReminderInitializer } from "./components/ReminderInitializer";
import { NotificationPermissionHandler } from "./components/NotificationPermissionHandler";
// GlobalCardioTimer removed - using system notifications only

// Import scroll fix
import "./utils/scrollFix";

const queryClient = new QueryClient();

// Component to handle back button
const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      // If we're on the dashboard or landing page, exit the app
      if (location.pathname === '/dashboard' || location.pathname === '/' || location.pathname === '/auth') {
        CapacitorApp.exitApp();
      } else {
        // Otherwise, navigate back
        navigate(-1);
      }
    });

    return () => {
      handleBackButton.remove();
    };
  }, [navigate, location]);

  return null;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Check if this is the first load
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
      setIsFirstLoad(false);
    }

    // Restore session on app start
    const restoreSession = async () => {
      const { sessionManager } = await import('./lib/sessionManager');
      console.log('🚀 App started - checking for existing session...');
      
      const isLoggedIn = await sessionManager.isLoggedIn();
      if (isLoggedIn) {
        console.log('✅ User is logged in - restoring session');
        await sessionManager.restoreSession();
      } else {
        console.log('ℹ️ No active session found');
      }
    };
    restoreSession();

    // Handle app resume - update last active time and restore session
    const handleAppStateChange = CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        console.log('📱 App resumed - updating last active time');
        const { sessionManager } = await import('./lib/sessionManager');
        
        // Update last active timestamp
        await sessionManager.updateLastActive();
        
        // Restore session (will check expiry automatically)
        await sessionManager.restoreSession();
      }
    });

    return () => {
      handleAppStateChange.remove();
    };
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  // Force enable scrolling on app start
  useEffect(() => {
    const enableScrolling = () => {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      document.body.style.height = 'auto';
      
      const root = document.getElementById('root');
      if (root) {
        root.style.overflow = 'visible';
        root.style.height = 'auto';
      }
    };
    
    enableScrolling();
    // Re-enable after a short delay
    setTimeout(enableScrolling, 1000);
  }, []);

  // Show splash screen on first load
  if (showSplash && isFirstLoad) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="primeflex-theme">
        <TooltipProvider>
          <AuthProvider>
            <WaterReminderProvider>
              <CardioTimerProvider>
                <ReminderInitializer />
                <NotificationPermissionHandler />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <BackButtonHandler />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/strength" element={<Strength />} />
            <Route path="/mindmuscle" element={<MindMuscle />} />
            <Route path="/water" element={<Water />} />
            <Route path="/videos" element={<WorkoutVideos />} />
            <Route path="/cardio" element={<Cardio />} />
            <Route path="/steps" element={<Steps />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/height-growth" element={<HeightGrowth />} />
            <Route path="/form-detector" element={<FormDetector />} />
            <Route path="/home-workout" element={<HomeWorkout />} />
            <Route path="/calisthenics" element={<Calisthenics />} />
                        <Route path="/feedback" element={<Feedback />} />
            <Route path="/community" element={<Community />} />
            <Route path="/prime-flex-full-system" element={<PrimeFlexFullSystem />} />
            <Route path="/test-supabase" element={<SupabaseTestPage />} />
            <Route path="/supabase-test" element={<SupabaseTest />} />
            <Route path="/bucket-setup" element={<BucketSetupPage />} />
            <Route path="/rls-diagnostics" element={<RLSDiagnosticsPage />} />
            <Route path="/direct-insert-test" element={<DirectInsertTestPage />} />
            <Route path="/auth-debug" element={<AuthDebugPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/upload-video" element={<VideoUploadPage />} />
            <Route path="/ai-diet-plan" element={<AIDietPlanGenerator />} />
            <Route path="/diet-plan-tracker" element={<DietPlanTracker />} />
            <Route path="/saved-diet-plans" element={<SavedDietPlans />} />
            <Route path="/body-fat-calculator" element={<BodyFatCalculator />} />
            <Route path="/weekly-schedule" element={<WeeklySchedule />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
                </BrowserRouter>
              </CardioTimerProvider>
            </WaterReminderProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
