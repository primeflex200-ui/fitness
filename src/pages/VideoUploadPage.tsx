import React from 'react';
import VideoUpload from '@/components/VideoUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const VideoUploadPage: React.FC = () => {
  const handleUploadComplete = (videoData: any) => {
    console.log('Video uploaded:', videoData);
    // You can redirect or show success message here
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="h-8 w-8" />
              Video Upload
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Upload your workout videos with custom thumbnails
          </p>
        </div>

        {/* Upload Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Instructions</CardTitle>
            <CardDescription>
              Follow these steps to upload your video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Click on the video upload area to select your video file</li>
              <li>Optionally, click on the thumbnail area to select a thumbnail image</li>
              <li>Enter a title for your video (required)</li>
              <li>Add a description (optional)</li>
              <li>Click the "Upload Video" button to start uploading</li>
            </ol>
          </CardContent>
        </Card>

        {/* Video Upload Component */}
        <VideoUpload onUploadComplete={handleUploadComplete} />
      </div>
    </div>
  );
};

export default VideoUploadPage;
