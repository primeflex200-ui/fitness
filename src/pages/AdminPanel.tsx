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
  MessageSquare,
  Trash2,
  PlayCircle
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

interface UploadedVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  target_muscle: string | null;
  difficulty: string | null;
  is_featured: boolean | null;
  created_at: string;
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
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadFeedback();
    loadUploadedVideos();
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

  const loadUploadedVideos = async () => {
    setLoadingVideos(true);
    try {
      const { data, error } = await supabase
        .from("trainer_videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setUploadedVideos(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load uploaded videos",
        variant: "destructive",
      });
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleDeleteVideo = async (videoId: string, videoUrl: string) => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }

    try {
      // Extract file path from URL
      const urlParts = videoUrl.split('/');
      const filePath = `videos/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('trainer-videos')
        .remove([filePath]);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("trainer_videos")
        .delete()
        .eq("id", videoId);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });

      // Reload videos
      loadUploadedVideos();
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    }
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
      
      // Reload videos list
      loadUploadedVideos();
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

            {/* Uploaded Videos List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Uploaded Videos ({uploadedVideos.length})
                </CardTitle>
                <CardDescription>
                  Manage your uploaded training videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingVideos ? (
                  <p className="text-muted-foreground text-center py-8">Loading videos...</p>
                ) : uploadedVideos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No videos uploaded yet. Upload your first video above!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {uploadedVideos.map((video) => (
                      <Card key={video.id} className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-4">
                            {/* Thumbnail or placeholder */}
                            <div className="w-32 h-20 rounded bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {video.thumbnail_url ? (
                                <img 
                                  src={video.thumbnail_url} 
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <PlayCircle className="w-8 h-8 text-primary" />
                              )}
                            </div>

                            {/* Video Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1 truncate">{video.title}</h4>
                              {video.description && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                  {video.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs">
                                {video.target_muscle && (
                                  <span className="px-2 py-1 bg-primary/10 text-primary rounded capitalize">
                                    {video.target_muscle}
                                  </span>
                                )}
                                {video.difficulty && (
                                  <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded capitalize">
                                    {video.difficulty}
                                  </span>
                                )}
                                {video.is_featured && (
                                  <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Uploaded: {new Date(video.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(video.video_url, "_blank")}
                                title="Preview video"
                              >
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteVideo(video.id, video.video_url)}
                                title="Delete video"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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
