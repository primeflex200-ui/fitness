import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Video, Play, Heart, MessageCircle, Search, Star } from "lucide-react";
import { toast } from "sonner";

const Videos = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [likedVideos, setLikedVideos] = useState<string[]>([]);

  const trainerVideos = [
    { 
      id: "1", 
      title: "Perfect Squat Form Tutorial", 
      trainer: "Coach Marcus", 
      duration: "8:45", 
      category: "Legs",
      difficulty: "Beginner",
      views: "12.5K"
    },
    { 
      id: "2", 
      title: "Bench Press Technique Breakdown", 
      trainer: "Sarah Johnson", 
      duration: "10:20", 
      category: "Chest",
      difficulty: "Intermediate",
      views: "18.2K"
    },
    { 
      id: "3", 
      title: "Deadlift Mastery - Avoid Common Mistakes", 
      trainer: "Coach Marcus", 
      duration: "12:15", 
      category: "Back",
      difficulty: "Advanced",
      views: "25.8K"
    },
    { 
      id: "4", 
      title: "Shoulder Day Complete Workout", 
      trainer: "Alex Chen", 
      duration: "15:30", 
      category: "Shoulders",
      difficulty: "Intermediate",
      views: "9.4K"
    },
    { 
      id: "5", 
      title: "Core Strength & Abs Workout", 
      trainer: "Sarah Johnson", 
      duration: "11:00", 
      category: "Core",
      difficulty: "Beginner",
      views: "31.2K"
    },
    { 
      id: "6", 
      title: "Pull-up Progression for Beginners", 
      trainer: "Alex Chen", 
      duration: "9:30", 
      category: "Back",
      difficulty: "Beginner",
      views: "22.1K"
    },
    { 
      id: "7", 
      title: "Advanced Arm Training Techniques", 
      trainer: "Coach Marcus", 
      duration: "13:45", 
      category: "Arms",
      difficulty: "Advanced",
      views: "15.7K"
    },
    { 
      id: "8", 
      title: "Leg Day Intensity - Complete Session", 
      trainer: "Sarah Johnson", 
      duration: "18:20", 
      category: "Legs",
      difficulty: "Advanced",
      views: "19.3K"
    }
  ];

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

  const filteredVideos = trainerVideos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.category.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, i) => (
            <Card 
              key={video.id}
              className="border-border hover:border-primary transition-all hover-scale overflow-hidden cursor-pointer"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                <Play className="w-16 h-16 text-primary opacity-80" />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold">
                  {video.duration}
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
                <CardDescription className="text-sm">by {video.trainer}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {video.category}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getDifficultyColor(video.difficulty)}`}>
                      {video.difficulty}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {video.views} views
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No videos found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <Video className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">📹 Full Video Playback Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  Video streaming and interactive features are in development. For now, explore our trainer library 
                  and save your favorites. You can also like videos and leave comments to engage with the community!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Videos;
