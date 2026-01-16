import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const SupabaseDebugPage: React.FC = () => {
  const [debugOutput, setDebugOutput] = useState<string>("");

  const runDebugCheck = async () => {
    let output = "";

    // 1. Check env vars
    output += "=== ENV VARS ===\n";
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    output += `URL: ${url ? "✓ SET" : "✗ MISSING"}\n`;
    output += `KEY: ${key ? "✓ SET" : "✗ MISSING"}\n`;
    if (url) output += `URL value: ${url}\n`;

    // 2. Try simple selects on each table (type-safe)
    output += "\n=== TABLE ACCESS TEST ===\n";

    // Test feedback
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .limit(1);

      if (error) {
        output += `feedback: ✗ ERROR\n  ${error.message}\n`;
      } else {
        output += `feedback: ✓ OK (${data?.length || 0} rows)\n`;
      }
    } catch (err: any) {
      output += `feedback: ✗ EXCEPTION\n  ${err?.message}\n`;
    }

    // Test trainer_videos
    try {
      const { data, error } = await supabase
        .from("trainer_videos")
        .select("*")
        .limit(1);

      if (error) {
        output += `trainer_videos: ✗ ERROR\n  ${error.message}\n`;
      } else {
        output += `trainer_videos: ✓ OK (${data?.length || 0} rows)\n`;
      }
    } catch (err: any) {
      output += `trainer_videos: ✗ EXCEPTION\n  ${err?.message}\n`;
    }

    // Test community_messages
    try {
      const { data, error } = await supabase
        .from("community_messages")
        .select("*")
        .limit(1);

      if (error) {
        output += `community_messages: ✗ ERROR\n  ${error.message}\n`;
      } else {
        output += `community_messages: ✓ OK (${data?.length || 0} rows)\n`;
      }
    } catch (err: any) {
      output += `community_messages: ✗ EXCEPTION\n  ${err?.message}\n`;
    }

    // 3. Get current auth status
    output += "\n=== AUTH STATUS ===\n";
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      output += `Authenticated: ✓ YES\n  Email: ${sessionData.session.user.email}\n`;
    } else {
      output += `Authenticated: ✗ NO (using anon key)\n`;
    }

    // 4. Test storage bucket
    output += "\n=== STORAGE BUCKET ===\n";
    try {
      const { data, error } = await supabase.storage.from("trainer-videos").list("", { limit: 1 });
      if (error) {
        output += `trainer-videos bucket: ✗ ERROR\n  ${error.message}\n`;
      } else {
        output += `trainer-videos bucket: ✓ OK (${data?.length || 0} items)\n`;
      }
    } catch (err: any) {
      output += `trainer-videos bucket: ✗ EXCEPTION\n  ${err?.message}\n`;
    }

    output += "\n=== NEXT STEPS ===\n";
    output += "If tables show ✗ ERROR:\n";
    output += "1. Open https://app.supabase.com → your project\n";
    output += "2. SQL Editor → New Query\n";
    output += "3. Copy SQL from SUPABASE_TABLES_SETUP_IMMEDIATE.md\n";
    output += "4. Click Run\n";
    output += "5. Table Editor → Refresh\n";
    output += "6. Run this test again\n";

    setDebugOutput(output);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Diagnostic Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runDebugCheck} className="w-full">
              Run Diagnostic
            </Button>
            <div className="bg-muted p-4 rounded font-mono text-xs whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto border">
              {debugOutput || "Click 'Run Diagnostic' to test connection..."}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseDebugPage;
