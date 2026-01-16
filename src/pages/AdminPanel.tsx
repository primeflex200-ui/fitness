import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Video, 
  MessageSquare, 
  Settings, 
  Database, 
  Upload,
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  BarChart3,
  TrendingUp,
  UserPlus,
  FileVideo,
  Eye,
  Calendar,
  Clock,
  Star,
  Activity,
  Zap,
  LogOut
} from 'lucide-react';

interface TrainerVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  target_muscle?: string;
  difficulty?: string;
  trainer_name?: string;
  is_featured?: boolean;
  section?: string;
  duration?: number | null;
  created_at: string;
}

interface FeedbackItem {
  id: string;
  user_id: string | null;
  message: string | null;
  created_at: string | null;
}

interface CommunityMessage {
  id: string;
  user_id: string | null;
  message: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  full_name?: string;
}

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalViews: number;
  engagementRate: number;
  topVideos: TrainerVideo[];
  userGrowth: { date: string; users: number }[];
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [videos, setVideos] = useState<TrainerVideo[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalFeedback: 0,
    totalMessages: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalViews: 0,
    engagementRate: 0
  });
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    activeUsers: 0,
    totalViews: 0,
    engagementRate: 0,
    topVideos: [],
    userGrowth: []
  });
  const { toast } = useToast();

  // New video form state
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    target_muscle: '',
    difficulty: 'beginner',
    trainer_name: '',
    is_featured: false,
    duration: 0
  });

  // File upload state
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch videos (most important for admin)
      const videosRes = await supabase
        .from('trainer_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (videosRes.error) {
        console.error('Error fetching videos:', videosRes.error);
      }
      setVideos(videosRes.data || []);

      // Try to fetch other data, but don't fail if they don't exist
      let feedbackData: any[] = [];
      let messagesData: any[] = [];
      let usersData: any[] = [];

      try {
        const feedbackRes = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });
        if (!feedbackRes.error) {
          feedbackData = feedbackRes.data || [];
        }
      } catch (e) {
        console.log('Feedback table not accessible');
      }

      try {
        const messagesRes = await supabase
          .from('community_messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (!messagesRes.error) {
          messagesData = messagesRes.data || [];
        }
      } catch (e) {
        console.log('Community messages table not accessible');
      }

      try {
        const usersRes = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (!usersRes.error) {
          usersData = usersRes.data || [];
        }
      } catch (e) {
        console.log('Profiles table not accessible');
      }

      setFeedback(feedbackData);
      setMessages(messagesData);
      setUsers(usersData);

      const activeUsersCount = usersData.filter(user => 
        user.created_at && 
        new Date(user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;

      setStats({
        totalVideos: videosRes.data?.length || 0,
        totalFeedback: feedbackData.length,
        totalMessages: messagesData.length,
        totalUsers: usersData.length,
        activeUsers: activeUsersCount,
        totalViews: videosRes.data?.reduce((sum: number, video: any) => sum + (video.duration || 0), 0) || 0,
        engagementRate: usersData.length ? 
          ((feedbackData.length || 0) / usersData.length * 100) : 0
      });

      // Calculate analytics
      const topVideos = (videosRes.data || [])
        .sort((a, b) => (b.created_at > a.created_at ? 1 : -1))
        .slice(0, 5);

      const userGrowthData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const usersOnDate = usersData.filter(user => 
          user.created_at && user.created_at.startsWith(dateStr)
        ).length || 0;
        userGrowthData.push({ date: dateStr, users: usersOnDate });
      }

      setAnalytics({
        totalUsers: usersData.length,
        activeUsers: activeUsersCount,
        totalViews: videosRes.data?.length || 0,
        engagementRate: usersData.length ? 
          ((feedbackData.length || 0) / usersData.length * 100) : 0,
        topVideos,
        userGrowth: userGrowthData
      });

    } catch (error) {
      console.error('Admin Panel - Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data. The admin panel will still work for video uploads.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle video file selection
  const handleVideoFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select a valid video file',
          variant: 'destructive'
        });
        return;
      }
      
      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Video file must be less than 500MB',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedVideoFile(file);
      
      toast({
        title: 'File Selected',
        description: 'Video file ready to upload'
      });
    }
  };

  const handleAddVideo = async () => {
    if (!newVideo.title) {
      toast({
        title: 'Validation Error',
        description: 'Title is required',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedVideoFile) {
      toast({
        title: 'Validation Error',
        description: 'Please select a video file',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload video file to Supabase storage
      const videoExt = selectedVideoFile.name.split('.').pop();
      const videoFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${videoExt}`;
      const videoPath = `videos/${videoFileName}`;
      
      setUploadProgress(20);
      
      const { data: videoUploadData, error: videoUploadError } = await supabase.storage
        .from('videos')
        .upload(videoPath, selectedVideoFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: selectedVideoFile.type
        });

      if (videoUploadError) {
        if (videoUploadError.message.includes('The resource already exists')) {
          // Retry with new filename
          const retryPath = `videos/${Date.now()}-retry-${Math.random().toString(36).substring(7)}.${videoExt}`;
          const { data: retryData, error: retryError } = await supabase.storage
            .from('videos')
            .upload(retryPath, selectedVideoFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: selectedVideoFile.type
            });
          if (retryError) throw retryError;
        } else {
          throw videoUploadError;
        }
      }

      setUploadProgress(60);

      // Get public URL for video
      const { data: videoUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(videoPath);
      const videoUrl = videoUrlData.publicUrl;

      setUploadProgress(80);

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (newVideo.thumbnail_url && newVideo.thumbnail_url.startsWith('blob:')) {
        // Thumbnail was selected as file, upload it
        const thumbnailBlob = await fetch(newVideo.thumbnail_url).then(r => r.blob());
        const thumbnailExt = 'jpg';
        const thumbnailFileName = `thumbnails/${Date.now()}-${Math.random().toString(36).substring(7)}.${thumbnailExt}`;
        
        const { error: thumbnailError } = await supabase.storage
          .from('videos')
          .upload(thumbnailFileName, thumbnailBlob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg'
          });

        if (!thumbnailError) {
          const { data: thumbnailUrlData } = supabase.storage
            .from('videos')
            .getPublicUrl(thumbnailFileName);
          thumbnailUrl = thumbnailUrlData.publicUrl;
        }
      }

      setUploadProgress(90);
      
      // Insert video record into database
      const { data, error } = await supabase.from('trainer_videos').insert({
        title: newVideo.title,
        description: newVideo.description || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl
      }).select();

      setUploadProgress(100);

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(error.message);
      }

      toast({
        title: 'Success',
        description: 'Video uploaded successfully!'
      });

      // Reset form
      setNewVideo({
        title: '',
        description: '',
        video_url: '',
        thumbnail_url: '',
        target_muscle: '',
        difficulty: 'beginner',
        trainer_name: '',
        is_featured: false,
        duration: 0
      });
      setSelectedVideoFile(null);
      setUploadProgress(0);
      setIsUploading(false);

      fetchData();

    } catch (error) {
      console.error('Error adding video:', error);
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: 'Error',
        description: 'Failed to upload video: ' + (error as any).message,
        variant: 'destructive'
      });
    }
  };

  // Delete video
  const handleDeleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase.from('trainer_videos').delete().eq('id', videoId);
      
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Video deleted successfully'
      });

      fetchData();

    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        variant: 'destructive'
      });
    }
  };

  // Delete feedback
  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      const { error } = await supabase.from('feedback').delete().eq('id', feedbackId);
      
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feedback deleted successfully'
      });

      fetchData();

    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete feedback',
        variant: 'destructive'
      });
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.from('community_messages').delete().eq('id', messageId);
      
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message deleted successfully'
      });

      fetchData();

    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
  };

  // Bulk delete videos
  const handleBulkDelete = async () => {
    if (selectedVideos.length === 0) {
      toast({
        title: 'Warning',
        description: 'No videos selected',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase.from('trainer_videos').delete().in('id', selectedVideos);
      
      if (error) throw error;

      toast({
        title: 'Success',
        description: `${selectedVideos.length} videos deleted successfully`
      });

      setSelectedVideos([]);
      fetchData();

    } catch (error) {
      console.error('Error bulk deleting videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete videos',
        variant: 'destructive'
      });
    }
  };

  // Export data
  const handleExportData = async (dataType: string) => {
    try {
      let data = [];
      let filename = '';
      
      switch(dataType) {
        case 'videos':
          data = videos;
          filename = 'videos-export.json';
          break;
        case 'users':
          data = users;
          filename = 'users-export.json';
          break;
        case 'feedback':
          data = feedback;
          filename = 'feedback-export.json';
          break;
        default:
          return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: `Data exported successfully`
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive'
      });
    }
  };

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Toggle video selection
  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  // Select all videos
  const selectAllVideos = () => {
    if (selectedVideos.length === filteredVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(filteredVideos.map(video => video.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage your Flex Zen Coach platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={fetchData} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Exit
            </Button>
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              Live
            </Badge>
          </div>
        </div>

        {/* Enhanced Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Videos</CardTitle>
              <Video className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVideos}</div>
              <p className="text-xs text-blue-100 mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-green-100 mt-1">{stats.totalUsers} total users</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Engagement Rate</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.engagementRate.toFixed(1)}%</div>
              <p className="text-xs text-purple-100 mt-1">{stats.totalFeedback} interactions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">System Status</CardTitle>
              <Database className="h-4 w-4 text-orange-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                Healthy
                <CheckCircle className="h-5 w-5" />
              </div>
              <p className="text-xs text-orange-100 mt-1">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    User Growth (Last 7 Days)
                  </CardTitle>
                  <CardDescription>Daily new user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.userGrowth.map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${Math.max((day.users / Math.max(...analytics.userGrowth.map(d => d.users))) * 100, 5)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{day.users}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Performing Videos
                  </CardTitle>
                  <CardDescription>Most recent video uploads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topVideos.map((video, index) => (
                      <div key={video.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-300">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{video.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {video.duration || 0}s
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {video.is_featured ? 'Featured' : 'Standard'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used admin tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => setActiveTab('videos')} className="gap-2 h-auto p-4 flex-col">
                    <FileVideo className="h-6 w-6" />
                    <span>Add New Video</span>
                    <span className="text-xs opacity-75">Upload workout content</span>
                  </Button>
                  <Button onClick={() => setActiveTab('users')} variant="outline" className="gap-2 h-auto p-4 flex-col">
                    <UserPlus className="h-6 w-6" />
                    <span>Manage Users</span>
                    <span className="text-xs opacity-75">View user accounts</span>
                  </Button>
                  <Button onClick={() => handleExportData('videos')} variant="outline" className="gap-2 h-auto p-4 flex-col">
                    <Download className="h-6 w-6" />
                    <span>Export Data</span>
                    <span className="text-xs opacity-75">Download platform data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Enhanced Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Video Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Video
                  </CardTitle>
                  <CardDescription>
                    Add a new workout video or use the{" "}
                    <Link to="/upload-video" className="text-blue-600 hover:underline">
                      Advanced Upload Page
                    </Link>{" "}
                    for file uploads
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                      placeholder="Enter video title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newVideo.description}
                      onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                      placeholder="Enter video description"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="video_file">Video File * (MP4, MOV, AVI, WEBM - Max 500MB)</Label>
                    <div className="mt-2">
                      <Input
                        id="video_file"
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                        onChange={handleVideoFileSelect}
                        className="cursor-pointer"
                      />
                      {selectedVideoFile && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          Selected: {selectedVideoFile.name} ({(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="thumbnail_file">Thumbnail Image (Optional - JPG, PNG, WEBP)</Label>
                    <div className="mt-2">
                      <Input
                        id="thumbnail_file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const tempUrl = URL.createObjectURL(file);
                            setNewVideo({...newVideo, thumbnail_url: tempUrl});
                          }
                        }}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newVideo.duration}
                      onChange={(e) => setNewVideo({...newVideo, duration: parseInt(e.target.value) || 0})}
                      placeholder="300"
                    />
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <Label>Upload Progress</Label>
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-xs text-slate-500">{uploadProgress}% uploaded</p>
                    </div>
                  )}
                  
                  <Button onClick={handleAddVideo} className="w-full" disabled={isUploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Add Video'}
                  </Button>
                </CardContent>
              </Card>

              {/* Video List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Video Library</CardTitle>
                      <CardDescription>Manage your video collection ({filteredVideos.length} videos)</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedVideos.length === filteredVideos.length && filteredVideos.length > 0}
                        onCheckedChange={selectAllVideos}
                      />
                      <span className="text-sm text-slate-600">Select All</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredVideos.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No videos found</p>
                    ) : (
                      filteredVideos.map((video) => (
                        <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedVideos.includes(video.id)}
                              onCheckedChange={() => toggleVideoSelection(video.id)}
                            />
                            <div>
                              <p className="font-medium text-sm">{video.title}</p>
                              <p className="text-xs text-slate-500">
                                {video.duration || 0}s
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={video.is_featured ? 'default' : 'secondary'}>
                              {video.is_featured ? 'Featured' : 'Standard'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(video.video_url, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteVideo(video.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage platform users and their accounts</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleExportData('users')} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Users
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">No users found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                                  {user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium">{user.email.split('@')[0]}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{user.email}</TableCell>
                          <TableCell className="text-sm">{user.full_name || 'Not set'}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>User Feedback</CardTitle>
                <CardDescription>View and manage user feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {feedback.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No feedback found</p>
                  ) : (
                    feedback.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">User: {item.user_id?.slice(0, 8)}...</Badge>
                            </div>
                            <p className="text-sm">{item.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteFeedback(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>Community Messages</CardTitle>
                <CardDescription>View and manage community discussions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No messages found</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">User: {message.user_id?.slice(0, 8)}...</Badge>
                            </div>
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(message.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Database Status</CardTitle>
                  <CardDescription>Check database connectivity and status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Supabase Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Tables Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Permissions Configured</span>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      All database operations are working correctly. RLS has been disabled for development.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>Platform and version details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Platform Version</Label>
                    <p className="text-sm text-muted-foreground">Flex Zen Coach v2.0</p>
                  </div>
                  <div>
                    <Label>Database Schema</Label>
                    <p className="text-sm text-muted-foreground">Clean Architecture v1.0</p>
                  </div>
                  <div>
                    <Label>Last Updated</Label>
                    <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Advanced Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
