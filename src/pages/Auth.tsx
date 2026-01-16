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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative auth-container" style={{ 
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch'
    }}>
      {/* FloatingLines Background - Temporarily disabled for performance */}
      {/* <FloatingLines
        enabledWaves={['top', 'middle', 'bottom']}
        lineCount={[4, 7, 10]}
        lineDistance={[12, 10, 8]}
        bendRadius={3.0}
        bendStrength={-0.8}
        interactive={true}
        parallax={true}
        animationSpeed={0.7}
        linesGradient={['#c030d5', '#1f3a82', '#0d0d1a']}
        mixBlendMode="screen"
      /> */}
      
      <div className="w-full max-w-2xl animate-fade-in relative z-10">
        {/* Back Button - White Color */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white hover:text-yellow-500 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <PrimeFlexLogo showText size="lg" />
          </Link>
          <p className="text-muted-foreground">Your fitness journey starts here</p>
        </div>

        <Card className="border-border">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Sign in or create your account</CardDescription>
            </CardHeader>
            <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="login-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  
                  {showResendLink && (
                    <div className="text-sm text-muted-foreground">
                      Email not confirmed.{" "}
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        className="text-primary underline underline-offset-4"
                      >
                        Resend verification email
                      </button>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-semibold">Body Details (Optional)</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Update your profile information to get personalized recommendations
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-age">Age</Label>
                        <Input 
                          id="login-age" 
                          type="number" 
                          placeholder="25"
                          value={loginDetails.age}
                          onChange={(e) => setLoginDetails({...loginDetails, age: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-gender">Gender</Label>
                        <Select value={loginDetails.gender} onValueChange={(value) => setLoginDetails({...loginDetails, gender: value})}>
                          <SelectTrigger id="login-gender">
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

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-height">Height (cm)</Label>
                        <Input 
                          id="login-height" 
                          type="number" 
                          placeholder="170"
                          value={loginDetails.height}
                          onChange={(e) => setLoginDetails({...loginDetails, height: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-weight">Weight (kg)</Label>
                        <Input 
                          id="login-weight" 
                          type="number" 
                          placeholder="70"
                          value={loginDetails.weight}
                          onChange={(e) => setLoginDetails({...loginDetails, weight: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="login-goal">Fitness Goal</Label>
                      <Select value={loginDetails.fitness_goal} onValueChange={(value) => setLoginDetails({...loginDetails, fitness_goal: value})}>
                        <SelectTrigger id="login-goal">
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

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="login-diet">Diet Type</Label>
                      <Select value={loginDetails.diet_type} onValueChange={(value) => setLoginDetails({...loginDetails, diet_type: value})}>
                        <SelectTrigger id="login-diet">
                          <SelectValue placeholder="Select diet preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="veg">Vegetarian</SelectItem>
                          <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name *</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-name" 
                        type="text" 
                        placeholder="John Doe"
                        className="pl-10"
                        value={signupData.full_name}
                        onChange={(e) => setSignupData({...signupData, full_name: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        className="pl-10"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        required 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must be 8+ characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number (for reminders)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-phone" 
                        type="tel" 
                        placeholder="+91 9876543210"
                        className="pl-10"
                        value={signupData.phone_number}
                        onChange={(e) => setSignupData({...signupData, phone_number: e.target.value})}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optional - Used for water & workout SMS reminders
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-age">Age *</Label>
                      <Input 
                        id="signup-age" 
                        type="number" 
                        placeholder="25"
                        value={signupData.age}
                        onChange={(e) => setSignupData({...signupData, age: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-gender">Gender *</Label>
                      <Select value={signupData.gender} onValueChange={(value) => setSignupData({...signupData, gender: value})}>
                        <SelectTrigger id="signup-gender">
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
                      <Label htmlFor="signup-height">Height (cm) *</Label>
                      <Input 
                        id="signup-height" 
                        type="number" 
                        placeholder="170"
                        value={signupData.height}
                        onChange={(e) => setSignupData({...signupData, height: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-weight">Weight (kg) *</Label>
                      <Input 
                        id="signup-weight" 
                        type="number" 
                        placeholder="70"
                        value={signupData.weight}
                        onChange={(e) => setSignupData({...signupData, weight: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-goal">Fitness Goal *</Label>
                    <Select value={signupData.fitness_goal} onValueChange={(value) => setSignupData({...signupData, fitness_goal: value})}>
                      <SelectTrigger id="signup-goal">
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
                    <Label htmlFor="signup-diet">Diet Type *</Label>
                    <Select value={signupData.diet_type} onValueChange={(value) => setSignupData({...signupData, diet_type: value})}>
                      <SelectTrigger id="signup-diet">
                        <SelectValue placeholder="Select diet preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">Vegetarian</SelectItem>
                        <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Admin Access */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm font-semibold mb-3">Admin Panel Access</p>
              <form onSubmit={handleAdminLogin} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  type="email"
                  placeholder="Admin email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Open Admin Panel"}
                </Button>
              </form>
              <p className="mt-2 text-xs text-muted-foreground">
                Use your assigned admin credentials to access trainer controls.
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;