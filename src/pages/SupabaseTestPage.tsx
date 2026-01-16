import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const SupabaseTestPage: React.FC = () => {
  const [status, setStatus] = useState<string>("Idle");

  const runQuickTest = async () => {
    setStatus("Checking env vars...");
    const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasKey = !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!hasUrl || !hasKey) {
      setStatus("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in env");
      return;
    }

    setStatus("Checking storage bucket 'trainer-videos'...");
    try {
      const { data, error } = await supabase.storage.from("trainer-videos").list("", { limit: 1 });
      if (error) throw error;
      setStatus(`Bucket accessible, items: ${data?.length ?? 0}`);
    } catch (err: any) {
      setStatus(`Bucket check failed: ${err.message}`);
      // continue to run table checks even if bucket fails
    }

    // Check database tables the app expects
    setStatus((s) => s + " — checking tables...");
    const tableChecks = [
      { name: "feedback", sql: () => supabase.from("feedback").select("id").limit(1) },
      { name: "trainer_videos", sql: () => supabase.from("trainer_videos").select("id").limit(1) },
      { name: "community_messages", sql: () => supabase.from("community_messages").select("id").limit(1) },
    ];

    const results: string[] = [];
    for (const t of tableChecks) {
      try {
        const { data, error } = await t.sql();
        if (error) {
          results.push(`${t.name}: ERROR — ${error.message}`);
        } else {
          results.push(`${t.name}: OK`);
        }
      } catch (err: any) {
        results.push(`${t.name}: EXCEPTION — ${err?.message || JSON.stringify(err)}`);
      }
    }

    setStatus((s) => s + " — " + results.join(" | "));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Quick Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Status: {status}</p>
            <div className="space-y-2">
              <Button onClick={runQuickTest}>Run Quick Test</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseTestPage;
