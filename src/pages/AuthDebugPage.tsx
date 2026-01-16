import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle } from "lucide-react";

const AuthDebugPage = () => {
  const { toast } = useToast();
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    const getAuthInfo = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        console.log("[AuthDebug] Session:", session);
        console.log("[AuthDebug] User:", user);

        setAuthInfo({
          isAuthenticated: !!session,
          userId: user?.id,
          email: user?.email,
          sessionToken: session?.access_token ? "✅ Present" : "❌ Missing",
          sessionRefreshToken: session?.refresh_token ? "✅ Present" : "❌ Missing",
        });
      } catch (err: any) {
        console.error("[AuthDebug] Error:", err);
        setAuthInfo({ error: err.message });
      } finally {
        setLoading(false);
      }
    };

    getAuthInfo();
  }, []);

  const testAuthenticated = async () => {
    setTestResult(null);

    try {
      // Try to get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTestResult({
          success: false,
          message: "❌ NOT AUTHENTICATED",
          details: "You are not logged in. The app is using anonymous access, which has RLS restrictions.",
          solution: "Log in or create an account first!",
        });
        return;
      }

      // Try authenticated insert
      const { data, error } = await supabase
        .from("trainer_videos")
        .insert({
          title: "Auth Test " + Date.now(),
          video_url: "https://test.com/test.mp4",
        })
        .select();

      if (error) {
        setTestResult({
          success: false,
          message: "❌ AUTHENTICATED INSERT FAILED",
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      } else {
        setTestResult({
          success: true,
          message: "✅ AUTHENTICATED INSERT WORKED!",
          data: data,
        });

        // Clean up
        if (data && data[0]) {
          await supabase.from("trainer_videos").delete().eq("id", data[0].id);
        }
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: "❌ ERROR",
        error: err.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Loading auth info...</p>
            ) : authInfo?.error ? (
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded">
                <p className="text-red-700 dark:text-red-300">{authInfo.error}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {authInfo?.isAuthenticated ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-semibold">
                    {authInfo?.isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
                  </span>
                </div>

                <div className="bg-muted p-3 rounded space-y-2 font-mono text-sm">
                  <p><span className="text-muted-foreground">User ID:</span> {authInfo?.userId || "None"}</p>
                  <p><span className="text-muted-foreground">Email:</span> {authInfo?.email || "Not logged in"}</p>
                  <p><span className="text-muted-foreground">Access Token:</span> {authInfo?.sessionToken}</p>
                  <p><span className="text-muted-foreground">Refresh Token:</span> {authInfo?.sessionRefreshToken}</p>
                </div>

                <Button onClick={testAuthenticated} className="w-full">
                  Test Authenticated Insert
                </Button>
              </div>
            )}

            {testResult && (
              <div className={`p-4 rounded-lg border-2 ${
                testResult.success
                  ? "bg-green-50 dark:bg-green-950 border-green-300"
                  : "bg-red-50 dark:bg-red-950 border-red-300"
              }`}>
                <div className="flex items-start gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <h3 className={`font-bold ${
                    testResult.success
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}>
                    {testResult.message}
                  </h3>
                </div>
                {testResult.solution && (
                  <p className="text-sm mb-2">{testResult.solution}</p>
                )}
                <pre className="text-xs overflow-auto max-h-48 whitespace-pre-wrap break-words">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded text-sm space-y-2">
              <p className="font-semibold">What This Shows:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>If you're authenticated or anonymous</li>
                <li>Your user ID and email</li>
                <li>If you have valid tokens</li>
                <li>Whether authenticated inserts work</li>
              </ul>
              <p className="text-xs mt-3 italic">
                If it says "Not Authenticated", you need to log in at /auth first!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthDebugPage;
