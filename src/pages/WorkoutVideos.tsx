import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Video, Search, Upload, Play, Clock, Calendar, X } from 'lucide-react';

interface TrainerVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  created_at: string;
  trainer_id?: string;
  target_muscle?: string;
  difficulty?: string;
  trainer_name?: string;
  is_featured?: boolean;
  section?: string;
}

const WorkoutVideos = () => {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState<TrainerVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<TrainerVideo | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    fetchVideos();
    // Get search query from URL
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('trainer_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos((data || []) as TrainerVideo[]);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      </div>
    );
  }

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
            <span className="text-xl font-bold">Workout Videos</span>
          </div>
          {isAdmin && (
            <Link to="/upload-video">
              <Button variant="default" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Video
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Workout Videos</h1>
          <p className="text-muted-foreground">Expert guidance for your fitness journey</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No videos found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try a different search term' : 'No workout videos have been uploaded yet'}
              </p>
              {isAdmin && (
                <Link to="/upload-video">
                  <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload First Video
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video bg-slate-900">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-16 h-16 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelectedVideo(video);
                        setIsPlayerOpen(true);
                      }}
                      className="bg-primary hover:bg-primary/90 text-white rounded-full p-4"
                    >
                      <Play className="w-8 h-8" />
                    </button>
                  </div>
                  {video.duration && (
                    <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(video.duration)}
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  {video.description && (
                    <CardDescription className="line-clamp-2">
                      {video.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(video.created_at).toLocaleDateString()}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        setSelectedVideo(video);
                        setIsPlayerOpen(true);
                      }}
                    >
                      <Play className="w-3 h-3" />
                      Watch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Dialog */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{selectedVideo?.title}</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlayerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {selectedVideo?.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedVideo.description}
              </p>
            )}
          </DialogHeader>
          <div className="aspect-video bg-black">
            {selectedVideo && (
              <video
                key={selectedVideo.id}
                controls
                controlsList="nodownload"
                className="w-full h-full"
                poster={selectedVideo.thumbnail_url || undefined}
                autoPlay
              >
                <source src={selectedVideo.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutVideos;
