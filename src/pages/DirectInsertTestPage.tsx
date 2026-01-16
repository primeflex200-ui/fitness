import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DirectInsertTestPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testDirectInsert = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("[DirectInsertTest] Starting direct insert test...");

      // Try the simplest possible insert
      const testData = {
        title: "Test Video " + new Date().getTime(),
        video_url: "https://example.com/test.mp4",
      };

      console.log("[DirectInsertTest] Inserting:", testData);

      const { data, error } = await supabase
        .from("trainer_videos")
        .insert(testData)
        .select();

      if (error) {
        console.error("[DirectInsertTest] Insert error:", error);
        setResult({
          success: false,
          error: error.message,
          details: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
        });

        toast({
          title: "Insert Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("[DirectInsertTest] Insert successful:", data);
        setResult({
          success: true,
          data: data,
          message: "Direct insert worked! RLS is not the issue.",
        });

        // Clean up - delete the test row
        if (data && data[0]) {
          await supabase.from("trainer_videos").delete().eq("id", data[0].id);
          console.log("[DirectInsertTest] Cleaned up test row");
        }

        toast({
          title: "Success",
          description: "Direct insert worked!",
        });
      }
    } catch (err: any) {
      console.error("[DirectInsertTest] Exception:", err);
      setResult({
        success: false,
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkTableStructure = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("[DirectInsertTest] Checking table structure...");

      // Get one row to see table structure
      const { data, error } = await supabase
        .from("trainer_videos")
        .select("*")
        .limit(1);

      if (error) {
        setResult({
          success: false,
          error: `Can't read table: ${error.message}`,
        });
      } else {
        setResult({
          success: true,
          message: "Table structure check",
          data: {
            rowCount: data?.length || 0,
            firstRow: data?.[0] || "No rows found",
            columns: data?.[0] ? Object.keys(data[0]) : "N/A",
          },
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Direct Insert Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                onClick={testDirectInsert}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Testing..." : "Test Direct Insert"}
              </Button>
              
              <Button
                onClick={checkTableStructure}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? "Checking..." : "Check Table Structure"}
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border-2 ${
                result.success
                  ? "bg-green-50 dark:bg-green-950 border-green-300"
                  : "bg-red-50 dark:bg-red-950 border-red-300"
              }`}>
                <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap break-words">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded text-sm">
              <p className="font-semibold mb-2">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Test Direct Insert" to try inserting a test video</li>
                <li>If it succeeds (green), RLS is not the issue</li>
                <li>If it fails (red), check the error message</li>
                <li>Click "Check Table Structure" to verify the table exists</li>
                <li>Share the error with me if it still fails</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectInsertTestPage;
