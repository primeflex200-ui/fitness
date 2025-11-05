import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Video, Play, Heart, MessageCircle, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TrainerVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  target_muscle: string | null;
  difficulty: string | null;
  trainer_name: string | null;
  is_featured: boolean | null;
  created_at: string;
}

const Videos = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [videos, setVideos] = useState<TrainerVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from("trainer_videos")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching trainer videos:", error);
          toast.error("Failed to load videos");
        } else {
          setVideos(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const trainerOfWeek = {
    name: "Coach Marcus",
    specialty: "Powerlifting & Form",
    bio: "15+ years experience, certified strength coach",
    videos: 47
  };

  const toggleLike = (videoId: string) => {
    if (likedVideos.includes(videoId)) {
      setLikedVideos(likedVideos.filter(id => id !== videoId));
      toast.info("Removed from favorites");
    } else {
      setLikedVideos([...likedVideos, videoId]);
      toast.success("Added to favorites");
    }
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (video.target_muscle?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (video.difficulty?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-green-500 border-green-500";
      case "Intermediate": return "text-yellow-500 border-yellow-500";
      case "Advanced": return "text-red-500 border-red-500";
      default: return "text-primary border-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Video className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Trainer Videos</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Expert Training Videos</h1>
          <p className="text-muted-foreground">Learn from certified trainers and perfect your form</p>
        </div>

        {/* Trainer of the Week Banner */}
        <Card className="mb-8 border-primary/50 bg-gradient-to-r from-primary/20 to-secondary/20">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <Badge className="mb-2 bg-primary text-primary-foreground">Trainer of the Week</Badge>
                <h3 className="text-xl font-bold">{trainerOfWeek.name}</h3>
                <p className="text-sm text-muted-foreground">{trainerOfWeek.specialty}</p>
                <p className="text-xs text-muted-foreground mt-1">{trainerOfWeek.bio} • {trainerOfWeek.videos} videos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Feedback */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search videos, trainers, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link to="/feedback">
            <Button 
              variant="default" 
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Send Feedback
            </Button>
          </Link>
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50 animate-pulse" />
            <p className="text-muted-foreground">Loading videos...</p>
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, i) => (
              <Card 
                key={video.id}
                className="border-border hover:border-primary transition-all hover-scale overflow-hidden cursor-pointer"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => window.open(video.video_url, "_blank")}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center overflow-hidden">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Play className="w-16 h-16 text-primary opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-80" />
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-base leading-tight">{video.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(video.id);
                      }}
                    >
                      <Heart 
                        className={`w-4 h-4 ${likedVideos.includes(video.id) ? 'fill-red-500 text-red-500' : ''}`} 
                      />
                    </Button>
                  </div>
                  {video.trainer_name && (
                    <CardDescription className="text-sm text-primary">by {video.trainer_name}</CardDescription>
                  )}
                  {video.description && (
                    <CardDescription className="text-sm line-clamp-2 mt-1">{video.description}</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {video.target_muscle && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {video.target_muscle}
                      </Badge>
                    )}
                    {video.difficulty && (
                      <Badge variant="outline" className={`text-xs capitalize ${getDifficultyColor(video.difficulty)}`}>
                        {video.difficulty}
                      </Badge>
                    )}
                    {video.is_featured && (
                      <Badge className="text-xs bg-primary">
                        Featured
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">
              {searchQuery ? `No videos found matching "${searchQuery}"` : "No trainer videos uploaded yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {!searchQuery && "Upload videos through the Admin Panel to get started!"}
            </p>
          </div>
        )}

        {/* Info Card */}
        {videos.length > 0 && (
          <Card className="mt-8 border-primary/30 bg-primary/5">
            <CardContent className="py-6">
              <div className="flex items-start gap-3">
                <Video className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">📹 Click any video to watch</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on any video card to open and watch the full training video. Videos are uploaded and managed by trainers through the Admin Panel.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Videos;
