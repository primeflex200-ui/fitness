import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const signupSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: passwordSchema,
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  age: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 13 && parseInt(val) <= 120, {
    message: "Age must be between 13 and 120"
  }),
  gender: z.enum(["male", "female", "other"], { errorMap: () => ({ message: "Please select a gender" }) }),
  weight: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 20 && parseFloat(val) <= 500, {
    message: "Weight must be between 20-500 kg"
  }),
  height: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 50 && parseFloat(val) <= 300, {
    message: "Height must be between 50-300 cm"
  }),
  fitness_goal: z.enum(["fat_loss", "muscle_gain", "maintain"], { errorMap: () => ({ message: "Please select a fitness goal" }) }),
  diet_type: z.enum(["veg", "non_veg"], { errorMap: () => ({ message: "Please select your diet type" }) })
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupAge, setSignupAge] = useState("");
  const [signupGender, setSignupGender] = useState("");
  const [signupWeight, setSignupWeight] = useState("");
  const [signupHeight, setSignupHeight] = useState("");
  const [signupGoal, setSignupGoal] = useState("");
  const [signupDiet, setSignupDiet] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate inputs
    const result = signupSchema.safeParse({
      email: signupEmail,
      password: signupPassword,
      full_name: signupName,
      age: signupAge,
      gender: signupGender,
      weight: signupWeight,
      height: signupHeight,
      fitness_goal: signupGoal,
      diet_type: signupDiet
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      setIsLoading(false);
      return;
    }
    
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: signupName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (authError) {
      toast.error(authError.message);
      setIsLoading(false);
      return;
    }

    // Update profile with additional details
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          age: parseInt(signupAge),
          gender: signupGender,
          weight: parseFloat(signupWeight),
          height: parseFloat(signupHeight),
          fitness_goal: signupGoal,
          diet_type: signupDiet
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        toast.error("Account created but profile update failed. Please update in Settings.");
      } else {
        toast.success("Account created! Welcome to PRIME FLEX");
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Dumbbell className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-gradient-gold">PRIME FLEX</span>
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
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
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
                    <Label htmlFor="login-password">Password</Label>
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
                  <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-name" 
                        type="text" 
                        placeholder="John Doe"
                        className="pl-10"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-age">Age</Label>
                      <Input 
                        id="signup-age" 
                        type="number" 
                        placeholder="25"
                        value={signupAge}
                        onChange={(e) => setSignupAge(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-gender">Gender</Label>
                      <Select value={signupGender} onValueChange={setSignupGender} required>
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-weight">Weight (kg)</Label>
                      <Input 
                        id="signup-weight" 
                        type="number" 
                        step="0.1"
                        placeholder="70"
                        value={signupWeight}
                        onChange={(e) => setSignupWeight(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-height">Height (cm)</Label>
                      <Input 
                        id="signup-height" 
                        type="number" 
                        step="0.1"
                        placeholder="170"
                        value={signupHeight}
                        onChange={(e) => setSignupHeight(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-goal">Fitness Goal</Label>
                    <Select value={signupGoal} onValueChange={setSignupGoal} required>
                      <SelectTrigger id="signup-goal">
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fat_loss">Fat Loss</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="maintain">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-diet">Diet Type</Label>
                    <Select value={signupDiet} onValueChange={setSignupDiet} required>
                      <SelectTrigger id="signup-diet">
                        <SelectValue placeholder="Select diet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">Vegetarian</SelectItem>
                        <SelectItem value="non_veg">Non-Vegetarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        className="pl-10"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must be 8+ characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
