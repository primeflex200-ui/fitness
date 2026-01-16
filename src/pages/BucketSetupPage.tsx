import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

const BucketSetupPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [buckets, setBuckets] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("");

  const checkBuckets = async () => {
    setLoading(true);
    setStatus("Checking buckets...");
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        setStatus(`Error: ${error.message}`);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setBuckets(data || []);
        setStatus(`Found ${(data || []).length} buckets`);
        console.log("Buckets:", data);
      }
    } catch (error: any) {
      setStatus(`Exception: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createBucket = async () => {
    setLoading(true);
    setStatus("Creating videos bucket...");
    try {
      const { data, error } = await supabase.storage.createBucket("videos", {
        public: true
      });

      if (error) {
        setStatus(`Error: ${error.message}`);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        console.error("Bucket creation error:", error);
      } else {
        setStatus("Bucket created successfully!");
        toast({
          title: "Success",
          description: "videos bucket created successfully!",
        });
        await checkBuckets();
      }
    } catch (error: any) {
      setStatus(`Exception: ${error.message}`);
      console.error("Bucket creation exception:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create bucket",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    setLoading(true);
    setStatus("Testing upload...");
    try {
      // Create a small test file
      const testContent = new Blob(["test video content"], { type: "video/mp4" });
      const testFile = new File([testContent], "test.mp4", { type: "video/mp4" });

      const { data, error } = await supabase.storage
        .from("videos")
        .upload(`test/test-${Date.now()}.mp4`, testFile, { upsert: false });

      if (error) {
        setStatus(`Upload error: ${error.message}`);
        toast({
          title: "Upload Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setStatus("Test upload successful!");
        toast({
          title: "Success",
          description: "Test file uploaded successfully",
        });
        console.log("Upload result:", data);
      }
    } catch (error: any) {
      setStatus(`Exception: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Storage Setup</CardTitle>
            <CardDescription>Configure and test the trainer-videos bucket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="bg-muted p-4 rounded">
              <p className="text-sm font-mono text-foreground">{status || "Ready"}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={checkBuckets}
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Check Existing Buckets
              </Button>

              <Button
                onClick={createBucket}
                disabled={loading}
                className="w-full"
                variant="secondary"
              >
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Create videos Bucket
              </Button>

              <Button
                onClick={testUpload}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Test Upload
              </Button>
            </div>

            {/* Buckets List */}
            {buckets.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Available Buckets:</h3>
                <div className="space-y-2">
                  {buckets.map((bucket) => (
                    <div key={bucket.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                      {bucket.name === "videos" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-mono text-sm">{bucket.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Public: {bucket.public ? "Yes" : "No"} | ID: {bucket.id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded space-y-2">
              <h3 className="font-semibold text-sm">Steps:</h3>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Click "Check Existing Buckets" to see what buckets exist</li>
                <li>If "videos" bucket doesn't exist, click "Create videos Bucket"</li>
                <li>Click "Test Upload" to verify uploads work</li>
                <li>Go back to Admin Panel and try uploading a video</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BucketSetupPage;
