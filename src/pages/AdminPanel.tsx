import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Video, 
  Upload, 
  Edit, 
  Settings, 
  FileText, 
  Save, 
  Shield,
  MessageSquare 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const videoSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  muscle: z.string().max(100, "Muscle name too long").optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"])
});

interface FeedbackItem {
  id: string;
  message: string;
  created_at: string;
  profiles: {
    email: string;
  } | null;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoMuscle, setVideoMuscle] = useState("");
  const [videoDifficulty, setVideoDifficulty] = useState("Beginner");
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadFeedback();
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [isAdmin, loading, navigate, toast]);

  const loadFeedback = async () => {
    const { data, error } = await supabase
      .from("feedback")
      .select("id, message, created_at, user_id")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive",
      });
      return;
    }

    if (!data || data.length === 0) {
      setFeedback([]);
      return;
    }

    // Get unique user IDs
    const userIds = [...new Set(data.map(item => item.user_id))];
    
    // Fetch all profiles in a single query
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    // Create a map for quick lookup
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Combine feedback with profiles
    const feedbackWithProfiles = data.map(item => ({
      ...item,
      profiles: profileMap.get(item.user_id) || { email: "Unknown" }
    }));

    setFeedback(feedbackWithProfiles);
  };

  const handleVideoUpload = async () => {
    if (!videoFile) {
      toast({
        title: "File Required",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }

    // Validate input
    const validation = videoSchema.safeParse({
      title: videoTitle,
      description: videoDescription,
      muscle: videoMuscle,
      difficulty: videoDifficulty
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload video file to storage
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trainer-videos')
        .upload(filePath, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trainer-videos')
        .getPublicUrl(filePath);

      // Save video metadata to database
      const { error: dbError } = await supabase.from("trainer_videos").insert({
        title: videoTitle,
        description: videoDescription,
        video_url: publicUrl,
        target_muscle: videoMuscle,
        difficulty: videoDifficulty,
        is_featured: isFeatured,
      });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Success!",
        description: "Video uploaded successfully",
      });

      // Reset form
      setVideoTitle("");
      setVideoDescription("");
      setVideoFile(null);
      setVideoMuscle("");
      setVideoDifficulty("Beginner");
      setIsFeatured(false);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "An error occurred while uploading",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">PRIME FLEX Trainer Admin Panel</h1>
              </div>
              <p className="text-sm text-muted-foreground">Manage app content and features</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="videos">
              <Video className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="diet">
              <Edit className="h-4 w-4 mr-2" />
              Diet Plans
            </TabsTrigger>
            <TabsTrigger value="features">
              <Settings className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="files">
              <FileText className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
          </TabsList>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  User Feedback
                </CardTitle>
                <CardDescription>
                  View and manage feedback submitted by users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedback.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No feedback submissions yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {feedback.map((item) => (
                      <Card key={item.id} className="bg-muted/50">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium">
                              {item.profiles?.email || "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm">{item.message}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Upload Tab */}
          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Trainer Video
                </CardTitle>
                <CardDescription>
                  Add new workout videos or tutorials for users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-title">Title *</Label>
                  <Input
                    id="video-title"
                    placeholder="E.g., Perfect Push-Up Form"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-description">Description</Label>
                  <Textarea
                    id="video-description"
                    placeholder="Describe what this video covers..."
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-file">Video File * (MP4, MOV, AVI, WEBM - Max 500MB)</Label>
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                  />
                  {videoFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-muscle">Target Muscle Group</Label>
                    <Input
                      id="target-muscle"
                      placeholder="E.g., Chest, Back, Legs"
                      value={videoMuscle}
                      onChange={(e) => setVideoMuscle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={videoDifficulty}
                      onChange={(e) => setVideoDifficulty(e.target.value)}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-input"
                  />
                  <Label htmlFor="featured">Mark as Featured</Label>
                </div>

                <Button 
                  onClick={handleVideoUpload} 
                  className="w-full"
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Video"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diet Plans Tab */}
          <TabsContent value="diet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit Diet Plans
                </CardTitle>
                <CardDescription>
                  Manage diet plans and meal options for users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Diet plan management interface coming soon. You'll be able to add, edit, and
                  remove meals from all diet categories.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manage Features
                </CardTitle>
                <CardDescription>
                  Toggle feature visibility and update content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Feature management interface coming soon. You'll be able to toggle features,
                  update descriptions, and manage supplement information.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File Management
                </CardTitle>
                <CardDescription>
                  View and manage uploaded media files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  File browser coming soon. You'll be able to view, rename, and delete uploaded
                  media files.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Publish Changes
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
