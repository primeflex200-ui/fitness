import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Loader, Copy } from "lucide-react";

const RLSDiagnosticsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rlsStatus, setRlsStatus] = useState<any>(null);
  const [error, setError] = useState("");

  const checkRLSStatus = async () => {
    setLoading(true);
    setError("");
    setRlsStatus(null);
    
    try {
      // Try to insert a test row
      const { data, error: insertError } = await supabase
        .from("trainer_videos")
        .insert({
          title: "RLS Test",
          video_url: "https://test.com/test.mp4",
          description: "Testing RLS policy",
        })
        .select();

      if (insertError) {
        setError(`RLS BLOCKING INSERTS: ${insertError.message}`);
        setRlsStatus({
          rlsEnabled: true,
          canInsert: false,
          message: insertError.message,
        });
        toast({
          title: "RLS is Blocking Uploads",
          description: "You need to run the SQL to disable RLS",
          variant: "destructive",
        });
      } else {
        // Delete test row
        if (data && data[0]) {
          await supabase.from("trainer_videos").delete().eq("id", data[0].id);
        }
        
        setRlsStatus({
          rlsEnabled: false,
          canInsert: true,
          message: "RLS is DISABLED - uploads should work!",
        });
        toast({
          title: "Success",
          description: "RLS is disabled - you can upload videos!",
        });
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copySQL = () => {
    const sql = `-- Run this in Supabase SQL Editor
create extension if not exists pgcrypto;

drop table if exists public.trainer_videos cascade;
create table public.trainer_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  target_muscle text,
  difficulty text,
  trainer_name text,
  is_featured boolean default false,
  section text,
  created_at timestamp with time zone default now()
);

drop table if exists public.feedback cascade;
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message text not null,
  created_at timestamp with time zone default now()
);

drop table if exists public.community_messages cascade;
create table public.community_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message text not null,
  created_at timestamp with time zone default now()
);

-- DISABLE RLS
ALTER TABLE public.trainer_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages DISABLE ROW LEVEL SECURITY;

-- GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.trainer_videos TO anon, authenticated, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.feedback TO anon, authenticated, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.community_messages TO anon, authenticated, public;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, public;`;

    navigator.clipboard.writeText(sql);
    toast({
      title: "Copied!",
      description: "SQL copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>RLS Policy Diagnostics</CardTitle>
            <CardDescription>Check if Row Level Security is blocking your uploads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Check Status Button */}
            <Button
              onClick={checkRLSStatus}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Checking RLS Status..." : "Check RLS Status"}
            </Button>

            {/* Status Display */}
            {rlsStatus && (
              <div className={`p-4 rounded-lg border-2 ${
                rlsStatus.rlsEnabled 
                  ? "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700" 
                  : "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700"
              }`}>
                <div className="flex items-start gap-3">
                  {rlsStatus.rlsEnabled ? (
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className={`font-bold text-lg ${
                      rlsStatus.rlsEnabled 
                        ? "text-red-700 dark:text-red-300" 
                        : "text-green-700 dark:text-green-300"
                    }`}>
                      {rlsStatus.rlsEnabled ? "⚠️ RLS IS BLOCKING UPLOADS" : "✅ RLS is Disabled"}
                    </h3>
                    <p className={`text-sm mt-2 ${
                      rlsStatus.rlsEnabled 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-green-600 dark:text-green-400"
                    }`}>
                      {rlsStatus.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
                <p className="text-sm font-mono text-yellow-700 dark:text-yellow-300">
                  {error}
                </p>
              </div>
            )}

            {/* SQL Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                🔧 To Fix: Run this SQL in Supabase
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Go to: <span className="font-mono">https://app.supabase.com → SQL Editor → New Query</span>
              </p>
              
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded font-mono text-xs whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                {`-- 1. Create tables
create extension if not exists pgcrypto;

drop table if exists public.trainer_videos cascade;
create table public.trainer_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  video_url text not null,
  thumbnail_url text,
  target_muscle text,
  difficulty text,
  trainer_name text,
  is_featured boolean default false,
  section text,
  created_at timestamp with time zone default now()
);

-- 2. DISABLE RLS
ALTER TABLE public.trainer_videos DISABLE ROW LEVEL SECURITY;

-- 3. GRANT PERMISSIONS
GRANT ALL ON TABLE public.trainer_videos TO anon, authenticated;`}
              </div>

              <Button
                onClick={copySQL}
                className="w-full"
                variant="secondary"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Full SQL
              </Button>
            </div>

            {/* Steps */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold">Steps to Fix:</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>Go to https://app.supabase.com → Your Project → SQL Editor</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>Click "New Query"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>Click "Copy Full SQL" button above and paste it</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <span>Click "RUN" button</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">5.</span>
                  <span>Come back here and click "Check RLS Status" again</span>
                </li>
              </ol>
            </div>

            {/* After Fix */}
            {rlsStatus && !rlsStatus.rlsEnabled && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-2 border-green-300 dark:border-green-700">
                <h3 className="font-bold text-green-700 dark:text-green-300 mb-2">✅ Ready to Upload!</h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  RLS is disabled. Now:
                </p>
                <ol className="text-sm text-green-600 dark:text-green-400 list-decimal list-inside mt-2 space-y-1">
                  <li>Make sure storage bucket "trainer-videos" exists</li>
                  <li>Go to /admin and upload a video</li>
                  <li>Check /videos to see your uploaded video</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RLSDiagnosticsPage;
