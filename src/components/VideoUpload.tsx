import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Video, Image, Loader2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { generateDietPlanFromVideo, saveDietPlanToDatabase } from '@/services/aiDietService';
import { useAuth } from '@/hooks/useAuth';

interface VideoUploadProps {
  onUploadComplete?: (videoData: any) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadComplete }) => {
  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoType, setVideoType] = useState<'workout' | 'diet'>('workout');
  const [fitnessGoal, setFitnessGoal] = useState<'fat_loss' | 'muscle_gain' | 'maintain' | 'athletic'>('fat_loss');
  const [dietType, setDietType] = useState<'veg' | 'nonveg'>('veg');
  
  // UI state
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [generatingDietPlan, setGeneratingDietPlan] = useState(false);
  
  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);

  const handleVideoFileClick = () => {
    videoFileRef.current?.click();
  };

  const handleThumbnailFileClick = () => {
    thumbnailFileRef.current?.click();
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedVideo(file);
        // File selected successfully
      } else {
        toast({
          title: 'Error',
          description: 'Please select a valid video file (MP4, MOV, AVI, WEBM)',
          variant: 'destructive'
        });
        if (videoFileRef.current) {
          videoFileRef.current.value = '';
        }
      }
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedThumbnail(file);
      } else {
        toast({
          title: 'Error',
          description: 'Please select a valid image file (JPG, PNG, etc.) for the thumbnail',
          variant: 'destructive'
        });
        if (thumbnailFileRef.current) {
          thumbnailFileRef.current.value = '';
        }
      }
    }
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    if (videoFileRef.current) {
      videoFileRef.current.value = '';
    }
  };

  const removeThumbnail = () => {
    setSelectedThumbnail(null);
    if (thumbnailFileRef.current) {
      thumbnailFileRef.current.value = '';
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      if (error.message.includes('The resource already exists')) {
        // Generate a new unique path if file already exists
        const fileExt = file.name.split('.').pop();
        const newPath = `${path.split('.')[0]}-${Date.now()}.${fileExt}`;
        return uploadFile(file, bucket, newPath);
      }
      throw error;
    }
    return data;
  };

  const getPublicUrl = (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const storeVideoInDatabase = async (videoData: any) => {
    try {
      const { data, error } = await supabase
        .from('trainer_videos')
        .insert([{
          title: videoData.title,
          description: videoData.description,
          video_url: videoData.video_url,
          thumbnail_url: videoData.thumbnail_url
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing video in database:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVideo) {
      toast({
        title: 'Error',
        description: 'Please select a video file',
        variant: 'destructive'
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title for the video',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Generate unique file names
      const videoExt = selectedVideo.name.split('.').pop();
      const videoFileName = `${uuidv4()}.${videoExt}`;
      const thumbnailFileName = selectedThumbnail 
        ? `thumbnails/${uuidv4()}.${selectedThumbnail.name.split('.').pop()}`
        : null;

      // Upload video file
      const videoPath = `videos/${videoFileName}`;
      const { path: videoPathInBucket } = await uploadFile(selectedVideo, 'videos', videoPath);
      const videoUrl = getPublicUrl('videos', videoPathInBucket);
      setUploadProgress(50);

      // Upload thumbnail if provided
      let thumbnailUrl = '';
      if (selectedThumbnail && thumbnailFileName) {
        const { path: thumbnailPathInBucket } = await uploadFile(selectedThumbnail, 'videos', thumbnailFileName);
        thumbnailUrl = getPublicUrl('videos', thumbnailPathInBucket);
      }
      setUploadProgress(80);

      // Store video data in database
      const videoData = {
        title,
        description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl
      };

      const savedVideo = await storeVideoInDatabase(videoData);
      setUploadProgress(90);

      // Generate diet plan if this is a diet video
      if (videoType === 'diet' && user) {
        setGeneratingDietPlan(true);
        try {
          const dietPlan = await generateDietPlanFromVideo(
            title,
            description,
            fitnessGoal,
            dietType
          );
          
          await saveDietPlanToDatabase(user.id, dietPlan, savedVideo.id);
          
          toast({
            title: 'Success',
            description: 'Diet plan generated and saved successfully!',
            variant: 'default'
          });
        } catch (error) {
          console.error('Error generating diet plan:', error);
          toast({
            title: 'Info',
            description: 'Video uploaded but diet plan generation failed. You can add meals manually.',
            variant: 'default'
          });
        } finally {
          setGeneratingDietPlan(false);
        }
      }
      
      setUploadProgress(100);

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedVideo(null);
      setSelectedThumbnail(null);
      if (videoFileRef.current) videoFileRef.current.value = '';
      if (thumbnailFileRef.current) thumbnailFileRef.current.value = '';

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(savedVideo);
      }

      toast({
        title: 'Success',
        description: 'Video uploaded successfully!',
        variant: 'default'
      });

    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload video. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload New Video</CardTitle>
        <CardDescription>
          Fill in the details below to upload a new video
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload */}
          <div className="space-y-2">
            <Label htmlFor="video">Video File * (MP4, MOV, AVI, WEBM - Max 500MB)</Label>
            {selectedVideo ? (
              <div className="relative p-4 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-xs">
                      {selectedVideo.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={removeVideo}
                  >
                    <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                onClick={handleVideoFileClick}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Choose File</span>
                </div>
                <p className="text-xs text-slate-400">No file chosen</p>
              </div>
            )}
            <Input
              ref={videoFileRef}
              id="video"
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              className="hidden"
              onChange={handleVideoFileChange}
            />
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail Image (Optional - JPG, PNG, WEBP)</Label>
            {selectedThumbnail ? (
              <div className="relative p-4 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Image className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-xs">
                      {selectedThumbnail.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {(selectedThumbnail.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={removeThumbnail}
                  >
                    <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                onClick={handleThumbnailFileClick}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Choose File</span>
                </div>
                <p className="text-xs text-slate-400">No file chosen</p>
              </div>
            )}
            <Input
              ref={thumbnailFileRef}
              id="thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleThumbnailFileChange}
            />
          </div>

          {/* Video Type Selection */}
          <div className="space-y-2">
            <Label>Video Type</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={videoType === 'workout' ? 'default' : 'outline'}
                onClick={() => setVideoType('workout')}
                className="flex-1"
              >
                Workout
              </Button>
              <Button
                type="button"
                variant={videoType === 'diet' ? 'default' : 'outline'}
                onClick={() => setVideoType('diet')}
                className="flex-1"
              >
                Diet Plan
              </Button>
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter video description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Diet Plan Options (only show if diet video) */}
          {videoType === 'diet' && (
            <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-semibold">AI will generate meal plans for:</p>
              
              <div className="space-y-2">
                <Label htmlFor="fitness-goal">Fitness Goal</Label>
                <select
                  id="fitness-goal"
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="fat_loss">Fat Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintain">Maintain</option>
                  <option value="athletic">Athletic</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diet-type">Diet Type</Label>
                <select
                  id="diet-type"
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="nonveg">Non-Vegetarian</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={uploading || generatingDietPlan || !selectedVideo || !title.trim()}
            >
              {uploading || generatingDietPlan ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {generatingDietPlan ? 'Generating Diet Plan...' : 'Uploading...'}
                </>
              ) : (
                'Upload Video'
              )}
            </Button>
            {(uploading || generatingDietPlan) && (
              <div className="mt-4 space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-slate-500 text-center">
                  {generatingDietPlan ? 'Generating AI meal plans...' : `${uploadProgress}% Complete`}
                </p>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;
