import { useEffect, useState } from 'react';
import { notificationPermissionService } from '@/services/notificationPermissionService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export const NotificationPermissionHandler = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  useEffect(() => {
    const checkAndRequestPermission = async () => {
      // Check if we've already asked
      const alreadyAsked = localStorage.getItem('notification_permission_asked');
      if (alreadyAsked) {
        setHasAsked(true);
        return;
      }

      // Check current permission status
      const hasPermission = await notificationPermissionService.checkPermission();
      
      if (!hasPermission && !hasAsked) {
        // Show dialog to explain why we need permission
        setTimeout(() => {
          setShowDialog(true);
        }, 2000); // Show after 2 seconds of app load
      }
    };

    checkAndRequestPermission();
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await notificationPermissionService.requestPermission();
    
    if (granted) {
      localStorage.setItem('notification_permission_asked', 'true');
      setShowDialog(false);
      setHasAsked(true);
    } else {
      // Permission denied, show settings instruction
      await notificationPermissionService.openSettings();
      localStorage.setItem('notification_permission_asked', 'true');
      setShowDialog(false);
      setHasAsked(true);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('notification_permission_asked', 'true');
    setShowDialog(false);
    setHasAsked(true);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Bell className="w-10 h-10 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Enable Notifications</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Get reminders for:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💧</span>
            <span className="text-sm">Water intake reminders</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏋️</span>
            <span className="text-sm">Workout reminders</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍎</span>
            <span className="text-sm">Meal time notifications</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleEnableNotifications}
            className="w-full"
          >
            Enable Notifications
          </Button>
          <Button
            onClick={handleSkip}
            variant="outline"
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
