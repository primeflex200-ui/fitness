import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User as UserIcon, Activity, Phone, ArrowLeft } from "lucide-react";
import PrimeFlexLogo from "@/components/PrimeFlexLogo";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import FloatingLines from "@/components/FloatingLines";
import GlassSurface from "@/components/GlassSurface";
import { googleAuthService } from "@/services/googleAuthService";
import Folder from "@/components/Folder";
import './AuthFlip.css';
import './AuthOptimized.css';

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const signupSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: passwordSchema,
  full_name: z.string().trim().min(1, "Name is required").max(100),
  phone_number: z.string().optional().refine((val) => !val || /^[+]?[\d\s-]{10,15}$/.test(val), {
    message: "Please enter a valid phone number"
  }),
  age: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 13 && parseInt(val) <= 120, {
    message: "Age must be between 13 and 120"
  }),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select gender" }),
  height: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 50 && parseFloat(val) <= 300, {
    message: "Height must be between 50-300 cm"
  }),
  weight: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 20 && parseFloat(val) <= 500, {
    message: "Weight must be between 20-500 kg"
  }),
  fitness_goal: z.enum(["fat_loss", "muscle_gain", "maintain", "athletic"], { required_error: "Please select fitness goal" }),
  diet_type: z.enum(["veg", "non_veg"], { required_error: "Please select diet type" })
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'folder' | 'login' | 'signup' | 'google'>('folder');
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginDetails, setLoginDetails] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitness_goal: "",
    diet_type: ""
  });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitness_goal: "",
    diet_type: ""
  });
  const [showResendLink, setShowResendLink] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const { user, loading: authLoading } = useAuth();
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        let errorMessage = error.message;
        const msgLower = error.message.toLowerCase();
        
        if (msgLower.includes("email not confirmed") || msgLower.includes("email not verified")) {
          setShowResendLink(true);
          errorMessage = "Please verify your email before logging in. Check your inbox for the verification link.";
        } else if (msgLower.includes("invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        }
        
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      // Only update profile with body details if user explicitly provided new values
      // This prevents overwriting existing saved data
      if (data.user) {
        const updateData: {
          age?: number;
          height?: number;
          weight?: number;
          gender?: string;
          fitness_goal?: string;
          diet_type?: string;
        } = {};
        
        // Only add fields that user explicitly filled in during this login
        if (loginDetails.age && loginDetails.age.trim() !== '') {
          const age = parseInt(loginDetails.age);
          if (age >= 13 && age <= 120) {
            updateData.age = age;
          }
        }
        if (loginDetails.height && loginDetails.height.trim() !== '') {
          const height = parseFloat(loginDetails.height);
          if (height >= 50 && height <= 300) {
            updateData.height = height;
          }
        }
        if (loginDetails.weight && loginDetails.weight.trim() !== '') {
          const weight = parseFloat(loginDetails.weight);
          if (weight >= 20 && weight <= 500) {
            updateData.weight = weight;
          }
        }
        if (loginDetails.gender && loginDetails.gender.trim() !== '') {
          updateData.gender = loginDetails.gender;
        }
        if (loginDetails.fitness_goal && loginDetails.fitness_goal.trim() !== '') {
          updateData.fitness_goal = loginDetails.fitness_goal;
        }
        if (loginDetails.diet_type && loginDetails.diet_type.trim() !== '') {
          updateData.diet_type = loginDetails.diet_type;
        }

        // Only update if user provided new values - don't overwrite existing data
        if (Object.keys(updateData).length > 0) {
          console.log("Updating profile with new values:", updateData);
          const { error: profileError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', data.user.id);

          if (profileError) {
            console.error("Profile update error:", profileError);
          } else {
            toast.success("Welcome back! Profile updated.");
          }
        }
      }

      // Save session to persistent storage
      const { sessionManager } = await import('@/lib/sessionManager');
      await sessionManager.saveSession();
      
      toast.success("Welcome back!");
      setIsLoading(false);
      
      // Navigate to dashboard after successful login
      navigate("/dashboard");
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.toLowerCase().includes("failed to fetch")) {
        toast.error("Failed to reach Supabase. Check internet, .env values, and allowed URLs.");
      } else {
        toast.error("Sign-in error. Please try again.");
      }
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: loginEmail,
        options: { emailRedirectTo: `${window.location.origin}/` }
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email sent. Please check your inbox.");
      }
    } catch (err: any) {
      toast.error("Could not resend verification. Try again later.");
      console.error("Resend verification error:", err);
    }
  };

  const handleFolderOptionSelect = (option: 'login' | 'signup' | 'google') => {
    if (option === 'google') {
      handleGoogleLogin();
    } else {
      setAuthMode(option);
    }
  };

  const handleBackToFolder = () => {
    setAuthMode('folder');
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await googleAuthService.signIn();
      
      if (error) {
        console.error("Google sign-in error:", error);
        toast.error("Google sign-in failed. Please try again.", {
          duration: 4000,
          description: error.message || "Please try again"
        });
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Save session to persistent storage
        const { sessionManager } = await import('@/lib/sessionManager');
        await sessionManager.saveSession();
        
        toast.success("Welcome! Signed in with Google.");
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      toast.error("Google Sign-In unavailable. Use Email/Password instead.", {
        duration: 4000,
        description: "OAuth credentials need to be configured"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail !== "primeflex200@gmail.com" || adminPassword !== "Primeflex@2025") {
      toast.error("Invalid admin credentials");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      toast.success("Welcome, Admin!");
      navigate("/admin");
    } catch (err: any) {
      toast.error("Admin sign-in failed.");
      console.error("Admin login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate inputs
    const result = signupSchema.safeParse(signupData);

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      setIsLoading(false);
      return;
    }
    
    try {
      const { error: signupError, data } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.full_name,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signupError) {
        toast.error(signupError.message);
        setIsLoading(false);
        return;
      }

      // Update profile with additional data
      if (data.user) {
        const profileUpdate: Record<string, any> = {
          age: parseInt(signupData.age),
          gender: signupData.gender,
          height: parseFloat(signupData.height),
          weight: parseFloat(signupData.weight),
          fitness_goal: signupData.fitness_goal,
          diet_type: signupData.diet_type
        };
        
        // Add phone number if provided
        if (signupData.phone_number) {
          profileUpdate.phone_number = signupData.phone_number;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', data.user.id);

        if (profileError) {
          console.error("Profile update error:", profileError);
        }
      }

      toast.success("Account created! Welcome to PRIME FLEX");
      setIsLoading(false);
      
      // Navigate to dashboard after successful signup
      navigate("/dashboard");
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.toLowerCase().includes("failed to fetch")) {
        toast.error("Failed to reach Supabase. Check internet, .env values, and allowed URLs.");
      } else {
        toast.error("Sign-up error. Please try again.");
      }
      console.error("Signup error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative auth-container" 
      data-scroll-container
      style={{
        backgroundImage: 'url(/auth-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Back Button - Fixed at top left */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 text-white hover:text-yellow-500 transition-colors font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>
      
      {/* PRIME FLEX Logo - Fixed at top center */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <Link to="/" className="inline-flex items-center justify-center gap-2">
          <PrimeFlexLogo showText size="lg" />
        </Link>
      </div>
      
      {/* Bottom text - Only show when in folder mode */}
      {authMode === 'folder' && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Choose Authentication Method</h2>
          <p className="text-gray-300">Click on the folder to explore your options</p>
        </div>
      )}
      
      <div className="w-full max-w-md animate-fade-in relative z-10 mt-20">
        
        
        {/* Show Folder or Auth Forms */}
        {authMode === 'folder' ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Folder 
              color="#FFD700" 
              size={2} 
              onOptionSelect={handleFolderOptionSelect}
              className=""
            />
          </div>
        ) : (
          <>
            {/* Auth Card */}
            <div 
              className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl animate-fade-in"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                animation: 'slideInUp 0.5s ease-out'
              }}
            >
              <div className="mb-6 text-center">
                <button
                  onClick={handleBackToFolder}
                  className="inline-flex items-center gap-1 text-gray-500 hover:text-yellow-600 transition-colors mb-4 text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Options</span>
                </button>
                <h2 className="text-2xl font-bold text-black mb-2">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-600">
                  {authMode === 'login' ? 'Sign in to your account' : 'Join the PRIME FLEX community'}
                </p>
              </div>
              
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-black font-medium">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        className="pl-10 bg-white border-gray-200 text-black placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-black font-medium">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        id="login-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 bg-white border-gray-200 text-black placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  
                  {showResendLink && (
                    <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      Email not confirmed.{" "}
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        className="text-yellow-600 underline underline-offset-4 font-medium"
                      >
                        Resend verification email
                      </button>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-xl" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-black font-medium">Full Name *</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        id="signup-name" 
                        type="text" 
                        placeholder="John Doe" 
                        className="pl-10 bg-white border-gray-200 text-black placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                        value={signupData.full_name}
                        onChange={(e) => setSignupData({...signupData, full_name: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-black font-medium">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        className="pl-10 bg-white border-gray-200 text-black placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-black font-medium">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 bg-white border-gray-200 text-black placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-age" className="text-black font-medium">Age *</Label>
                      <Input 
                        id="signup-age" 
                        type="number" 
                        placeholder="25"
                        className="bg-white border-gray-200 text-black placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                        value={signupData.age}
                        onChange={(e) => setSignupData({...signupData, age: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-gender" className="text-black font-medium">Gender *</Label>
                      <Select value={signupData.gender} onValueChange={(value) => setSignupData({...signupData, gender: value})}>
                        <SelectTrigger className="bg-white border-gray-200 text-black focus:border-yellow-500 focus:ring-yellow-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-height" className="text-black font-medium">Height (cm) *</Label>
                      <Input 
                        id="signup-height" 
                        type="number" 
                        placeholder="170"
                        className="bg-white border-gray-200 text-black placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                        value={signupData.height}
                        onChange={(e) => setSignupData({...signupData, height: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-weight" className="text-black font-medium">Weight (kg) *</Label>
                      <Input 
                        id="signup-weight" 
                        type="number" 
                        placeholder="70"
                        className="bg-white border-gray-200 text-black placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                        value={signupData.weight}
                        onChange={(e) => setSignupData({...signupData, weight: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-goal" className="text-black font-medium">Fitness Goal *</Label>
                    <Select value={signupData.fitness_goal} onValueChange={(value) => setSignupData({...signupData, fitness_goal: value})}>
                      <SelectTrigger className="bg-white border-gray-200 text-black focus:border-yellow-500 focus:ring-yellow-500">
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fat_loss">Fat Loss</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="maintain">Maintenance</SelectItem>
                        <SelectItem value="athletic">Athletic Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-diet" className="text-black font-medium">Diet Type *</Label>
                    <Select value={signupData.diet_type} onValueChange={(value) => setSignupData({...signupData, diet_type: value})}>
                      <SelectTrigger className="bg-white border-gray-200 text-black focus:border-yellow-500 focus:ring-yellow-500">
                        <SelectValue placeholder="Select diet preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">Vegetarian</SelectItem>
                        <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-xl" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;