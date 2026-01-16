import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Droplet, Plus, Minus, Bell, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { reminderService } from "@/services/reminderService";
import { WaterTrackingService } from "@/services/waterTrackingService";
import { WaterReminderModal } from "@/components/WaterReminderModal";
import { mobileNotificationService } from "@/services/mobileNotificationService";
import { Capacitor } from "@capacitor/core";
const Water = () => {
  const { user } = useAuth();
  const [manualUser, setManualUser] = useState<any>(null);
  const [dailyGoal, setDailyGoal] = useState(2500); // in ml
  const [consumed, setConsumed] = useState(0); // in ml
  const [servingSize, setServingSize] = useState(250); // in ml - amount per notification response

  // Modal state
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Notification settings
  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [waterReminder, setWaterReminder] = useState(true);
  const [waterInterval, setWaterInterval] = useState("60");
  const [mealReminder, setMealReminder] = useState(false);
  const [mealInterval, setMealInterval] = useState("180");
  
  // Timer ID for water reminders
  const [waterTimerId, setWaterTimerId] = useState<NodeJS.Timeout | null>(null);

  const percentage = Math.min((consumed / dailyGoal) * 100, 100);
  const glassesConsumed = Math.floor(consumed / 250);
  const glassesGoal = Math.ceil(dailyGoal / 250);

  // Manual session check on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setManualUser(session.user);
      }
    };
    checkSession();
  }, []);

  // Load water intake data on mount
  useEffect(() => {
    const data = WaterTrackingService.loadWaterIntake();
    setConsumed(data.consumed);
    setDailyGoal(data.goal);
    setServingSize(data.servingSize);
  }, []);

  // Save water intake data whenever it changes
  useEffect(() => {
    WaterTrackingService.saveWaterIntake(consumed, dailyGoal, servingSize);
  }, [consumed, dailyGoal, servingSize]);

  // Listen for water intake updates from service worker (notification actions)
  useEffect(() => {
    const handleWaterUpdate = (event: any) => {
      // Handle ADD_WATER message from service worker
      if (event.data && event.data.type === 'ADD_WATER') {
        const amount = event.data.amount || servingSize;
        const newConsumed = Math.min(consumed + amount, dailyGoal + 1000);
        setConsumed(newConsumed);
        toast.success(`Added ${amount}ml of water! 💧`);
      }
      
      // Handle GET_SERVING_SIZE request from service worker
      if (event.data && event.data.type === 'GET_SERVING_SIZE') {
        // Respond with current serving size
        event.ports[0]?.postMessage({ servingSize });
      }
    };

    // Listen for messages from service worker
    navigator.serviceWorker?.addEventListener('message', handleWaterUpdate);

    // Also listen for custom events from WaterTrackingService
    const handleCustomUpdate = (event: any) => {
      const data = event.detail;
      if (data) {
        setConsumed(data.consumed);
        setDailyGoal(data.goal);
        setServingSize(data.servingSize);
      }
    };

    window.addEventListener('waterIntakeUpdated', handleCustomUpdate);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleWaterUpdate);
      window.removeEventListener('waterIntakeUpdated', handleCustomUpdate);
    };
  }, [consumed, dailyGoal, servingSize]);

  // Register service worker for notification actions
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('✅ Service Worker registered:', registration);
      }).catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
    }
  }, []);

  // Load notification settings from localStorage and database
  useEffect(() => {
    const loadNotificationSettings = async () => {
      const currentUser = user || manualUser;
      if (!currentUser) return;

      // Load from localStorage first (instant)
      const savedSettings = localStorage.getItem('notification_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setWorkoutReminder(settings.workoutReminder ?? true);
          setWaterReminder(settings.waterReminder ?? true);
          setWaterInterval(settings.waterInterval?.toString() ?? "60");
          setMealReminder(settings.mealReminder ?? false);
          setMealInterval(settings.mealInterval?.toString() ?? "180");
          
          // Reinitialize reminders with saved settings
          await reminderService.initializeReminders(currentUser.id, {
            workoutReminder: settings.workoutReminder ?? true,
            waterReminder: settings.waterReminder ?? true,
            waterInterval: settings.waterInterval ?? 60,
            mealReminder: settings.mealReminder ?? false,
            mealInterval: settings.mealInterval ?? 180,
          });
        } catch (err) {
          console.error('Error parsing localStorage settings:', err);
        }
      }

      // Then try to load from database (backup)
      const dbSettings = await reminderService.loadSettings(currentUser.id);
      
      if (dbSettings && !savedSettings) {
        setWorkoutReminder(dbSettings.workoutReminder);
        setWaterReminder(dbSettings.waterReminder);
        setWaterInterval(dbSettings.waterInterval.toString());
        setMealReminder(dbSettings.mealReminder);
        setMealInterval(dbSettings.mealInterval.toString());
        
        // Save to localStorage for next time
        localStorage.setItem('notification_settings', JSON.stringify({
          workoutReminder: dbSettings.workoutReminder,
          waterReminder: dbSettings.waterReminder,
          waterInterval: dbSettings.waterInterval,
          mealReminder: dbSettings.mealReminder,
          mealInterval: dbSettings.mealInterval,
        }));
        
        // Initialize reminders
        await reminderService.initializeReminders(currentUser.id, dbSettings);
      }
    };

    loadNotificationSettings();
  }, [user, manualUser]);

  // Start water reminders (both system notification and modal)
  const startInAppWaterReminders = async () => {
    // Stop existing timer
    if (waterTimerId) {
      clearInterval(waterTimerId);
    }

    // Request notification permission
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Please allow notifications for the best experience');
      }
    }

    const intervalMs = parseInt(waterInterval) * 60 * 1000;
    console.log(`💧 Starting water reminders every ${waterInterval} minutes`);

    const timerId = setInterval(() => {
      console.log('💧 Sending water reminder');
      
      // Send system notification if permission granted
      if (Notification.permission === 'granted') {
        const notification = new Notification('💧 Hydration Time!', {
          body: `Time to drink ${servingSize}ml of water. Stay hydrated! 🚰`,
          icon: '/primeflex-icon.svg',
          badge: '/primeflex-icon.svg',
          tag: 'water-reminder',
          data: { servingSize },
        });

        // When notification is clicked, show modal
        notification.onclick = () => {
          window.focus();
          setShowReminderModal(true);
          notification.close();
        };
      } else {
        // Fallback to modal if no permission
        setShowReminderModal(true);
      }
    }, intervalMs);

    setWaterTimerId(timerId);
  };

  // Stop in-app water reminders
  const stopInAppWaterReminders = () => {
    if (waterTimerId) {
      clearInterval(waterTimerId);
      setWaterTimerId(null);
      console.log('💧 Water reminders stopped');
    }
  };

  // Handle modal Yes button
  const handleModalYes = () => {
    const newConsumed = Math.min(consumed + servingSize, dailyGoal + 1000);
    setConsumed(newConsumed);
    setShowReminderModal(false);
    toast.success(`Added ${servingSize}ml of water! 💧`);
  };

  // Handle modal No button
  const handleModalNo = () => {
    setShowReminderModal(false);
    toast.info('Reminder dismissed. Stay hydrated!');
  };

  // Save notification settings
  const handleSaveNotifications = async () => {
    try {
      const settings = {
        workoutReminder,
        waterReminder,
        waterInterval: parseInt(waterInterval) || 60,
        mealReminder,
        mealInterval: parseInt(mealInterval) || 180,
      };

      // Save to localStorage (always works)
      localStorage.setItem('notification_settings', JSON.stringify(settings));
      console.log('💾 Saved notification settings to localStorage:', settings);
      
      toast.success('Reminder settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('An error occurred while saving settings');
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
            <Droplet className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Water Reminder</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Stay Hydrated</h1>
          <p className="text-muted-foreground">Track your daily water intake</p>
        </div>

        {/* Main Tracker */}
        <Card className="mb-8 border-primary/50 bg-gradient-to-br from-cyan-500/10 to-transparent">
          <CardHeader className="text-center">
            <div className="relative w-40 h-40 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-cyan-500 transition-all duration-500"
                style={{
                  clipPath: `inset(${100 - percentage}% 0 0 0)`,
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Droplet className="w-16 h-16 text-cyan-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-cyan-500">
              {consumed}ml
            </div>
            <CardDescription className="text-lg">
              of {dailyGoal}ml daily goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={percentage} className="h-3 mb-4" />
            <div className="text-center text-sm text-muted-foreground">
              {glassesConsumed} / {glassesGoal} glasses (250ml each)
            </div>
          </CardContent>
        </Card>

        {/* Quick Add */}
        <Card className="mb-8 border-border bg-card/50">
          <CardHeader>
            <CardTitle>Quick Add</CardTitle>
            <CardDescription>Log your water intake</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[250, 500, 750].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  className="h-20 hover:border-cyan-500 hover:text-cyan-500"
                  onClick={() => {
                    const newAmount = Math.min(consumed + amount, dailyGoal + 1000);
                    setConsumed(newAmount);
                    toast.success(`Added ${amount}ml of water`);
                  }}
                >
                  <div>
                    <Plus className="w-5 h-5 mx-auto mb-1" />
                    <div className="font-bold">{amount}ml</div>
                  </div>
                </Button>
              ))}
            </div>
            
            {/* Custom Amount */}
            <div className="mb-6 p-4 border border-cyan-500/30 rounded-lg bg-cyan-500/5">
              <Label htmlFor="custom-amount" className="text-sm font-semibold mb-2 block">
                Custom Amount
              </Label>
              <div className="flex gap-2">
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="Enter ml"
                  min="1"
                  max="2000"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      const customAmount = parseInt(input.value);
                      if (customAmount > 0 && customAmount <= 2000) {
                        const newAmount = Math.min(consumed + customAmount, dailyGoal + 1000);
                        setConsumed(newAmount);
                        toast.success(`Added ${customAmount}ml of water`);
                        input.value = '';
                      } else {
                        toast.error('Please enter a value between 1-2000ml');
                      }
                    }
                  }}
                />
                <Button
                  variant="default"
                  className="bg-cyan-500 hover:bg-cyan-600"
                  onClick={(e) => {
                    const input = document.getElementById('custom-amount') as HTMLInputElement;
                    const customAmount = parseInt(input.value);
                    if (customAmount > 0 && customAmount <= 2000) {
                      const newAmount = Math.min(consumed + customAmount, dailyGoal + 1000);
                      setConsumed(newAmount);
                      toast.success(`Added ${customAmount}ml of water`);
                      input.value = '';
                    } else {
                      toast.error('Please enter a value between 1-2000ml');
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Enter any amount from 1-2000ml
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const newAmount = Math.max(consumed - 250, 0);
                  setConsumed(newAmount);
                  toast.info('Removed 250ml');
                }}
                disabled={consumed === 0}
              >
                <Minus className="w-4 h-4 mr-2" />
                Undo 250ml
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setConsumed(0);
                  toast.info('Reset water intake for the day');
                }}
                disabled={consumed === 0}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Goal Settings */}
        <Card className="mb-8 border-border bg-card/50">
          <CardHeader>
            <CardTitle>Daily Goal</CardTitle>
            <CardDescription>
              Adjust your target water intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {dailyGoal}ml
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.ceil(dailyGoal / 250)} glasses per day
                </div>
              </div>
              <Slider
                value={[dailyGoal]}
                onValueChange={(value) => setDailyGoal(value[0])}
                min={1000}
                max={5000}
                step={250}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1L</span>
                <span>5L</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Serving Size Setting */}
        <Card className="mb-8 border-primary/30 bg-gradient-to-r from-cyan-500/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-cyan-500" />
              Notification Serving Size
            </CardTitle>
            <CardDescription>
              Amount added when you click "Yes" on water reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-500 mb-2">
                  {servingSize}ml
                </div>
                <div className="text-sm text-muted-foreground">
                  per notification response
                </div>
              </div>
              <Slider
                value={[servingSize]}
                onValueChange={(value) => setServingSize(value[0])}
                min={100}
                max={1000}
                step={50}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100ml</span>
                <span>1000ml</span>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>How it works:</strong> When you receive a water reminder notification, 
                  click "Yes, I drank water" to automatically add {servingSize}ml to your daily intake!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="mt-8 border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your alerts and reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workout Reminders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="workout-reminder">Workout Reminders</Label>
                  <p className="text-sm text-muted-foreground">Daily training notifications</p>
                </div>
                <Switch 
                  id="workout-reminder" 
                  checked={workoutReminder}
                  onCheckedChange={setWorkoutReminder}
                />
              </div>
            </div>

            {/* Water Reminders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="water-reminder">Water Reminders</Label>
                  <p className="text-sm text-muted-foreground">Hydration alerts</p>
                </div>
                <Switch 
                  id="water-reminder" 
                  checked={waterReminder}
                  onCheckedChange={setWaterReminder}
                />
              </div>
              {waterReminder && (
                <div className="ml-4 mt-2 space-y-2">
                  <Label htmlFor="water-interval" className="text-sm">Reminder Interval (minutes)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="water-interval"
                      type="number"
                      min="1"
                      max="1440"
                      value={waterInterval}
                      onChange={(e) => setWaterInterval(e.target.value)}
                      placeholder="60"
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      {parseInt(waterInterval) === 1 ? 'minute' : 
                       parseInt(waterInterval) < 60 ? 'minutes' :
                       parseInt(waterInterval) === 60 ? '1 hour' :
                       parseInt(waterInterval) < 1440 ? `${Math.floor(parseInt(waterInterval) / 60)} hours ${parseInt(waterInterval) % 60 > 0 ? `${parseInt(waterInterval) % 60} min` : ''}` :
                       '1 day'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Enter any value from 1 to 1440 minutes (24 hours)</p>
                </div>
              )}
            </div>

            {/* Meal Reminders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="meal-reminder">Meal Reminders</Label>
                  <p className="text-sm text-muted-foreground">Diet plan notifications</p>
                </div>
                <Switch 
                  id="meal-reminder" 
                  checked={mealReminder}
                  onCheckedChange={setMealReminder}
                />
              </div>
              {mealReminder && (
                <div className="ml-4 mt-2 space-y-2">
                  <Label htmlFor="meal-interval" className="text-sm">Reminder Interval (minutes)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="meal-interval"
                      type="number"
                      min="1"
                      max="1440"
                      value={mealInterval}
                      onChange={(e) => setMealInterval(e.target.value)}
                      placeholder="180"
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      {parseInt(mealInterval) === 1 ? 'minute' : 
                       parseInt(mealInterval) < 60 ? 'minutes' :
                       parseInt(mealInterval) === 60 ? '1 hour' :
                       parseInt(mealInterval) < 1440 ? `${Math.floor(parseInt(mealInterval) / 60)} hours ${parseInt(mealInterval) % 60 > 0 ? `${parseInt(mealInterval) % 60} min` : ''}` :
                       '1 day'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Enter any value from 1 to 1440 minutes (24 hours)</p>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-border space-y-3">
              <Button 
                onClick={handleSaveNotifications}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                Save Reminder Settings
              </Button>

              {/* Simple Water Reminder Starter */}
              <Button 
                onClick={async () => {
                  console.log('💧 STARTING WATER REMINDERS...');
                  
                  const intervalMinutes = parseInt(waterInterval) || 60;
                  
                  // Check if on mobile
                  if (Capacitor.isNativePlatform()) {
                    // Use mobile notifications
                    const success = await mobileNotificationService.scheduleWaterReminders(intervalMinutes);
                    if (success) {
                      toast.success(`💧 Water reminders enabled! Every ${intervalMinutes} minute${intervalMinutes > 1 ? 's' : ''}`);
                      localStorage.setItem('waterReminderActive', 'true');
                    } else {
                      toast.error('Failed to enable notifications. Please check permissions in Settings.');
                    }
                  } else {
                    // Use web notifications
                    if (Notification.permission !== 'granted') {
                      const permission = await Notification.requestPermission();
                      if (permission !== 'granted') {
                        toast.error('Please allow notifications');
                        return;
                      }
                    }

                    // Stop any existing timer
                    if (waterTimerId) {
                      clearInterval(waterTimerId);
                    }

                    const intervalMs = intervalMinutes * 60 * 1000;

                    // Function to send notification
                    const sendWaterNotif = () => {
                      try {
                        const notif = new Notification('💧 Hydration Time!', {
                          body: `Time to drink ${servingSize}ml of water. Stay hydrated! 🚰`,
                          icon: '/primeflex-icon.svg',
                          badge: '/primeflex-icon.svg',
                          tag: 'water-reminder-' + Date.now(),
                          requireInteraction: true,
                        });

                        notif.onclick = () => {
                          setShowReminderModal(true);
                          notif.close();
                        };
                      } catch (error) {
                        console.error('Error sending notification:', error);
                      }
                    };

                    // Send immediate notification
                    sendWaterNotif();

                    // Set up recurring timer
                    const timerId = setInterval(sendWaterNotif, intervalMs);
                    setWaterTimerId(timerId);

                    toast.success(`Water reminders started! Every ${intervalMinutes} minute${intervalMinutes > 1 ? 's' : ''}`);
                  }
                }}
                variant="default"
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Droplet className="w-4 h-4" />
                💧 Start Water Reminders (Simple)
              </Button>

              {/* Stop Simple Reminders */}
              <Button 
                onClick={async () => {
                  if (Capacitor.isNativePlatform()) {
                    // Stop mobile notifications
                    await mobileNotificationService.stopWaterReminders();
                    localStorage.setItem('waterReminderActive', 'false');
                    toast.success('Water reminders stopped');
                  } else {
                    // Stop web timer
                    if (waterTimerId) {
                      clearInterval(waterTimerId);
                      setWaterTimerId(null);
                      toast.success('Water reminders stopped');
                    } else {
                      toast.info('No reminders running');
                    }
                  }
                }}
                variant="outline"
                className="w-full gap-2"
              >
                <Bell className="w-4 h-4" />
                Stop Water Reminders
              </Button>

              {/* Debug: Check Pending Notifications */}
              {Capacitor.isNativePlatform() && (
                <Button 
                  onClick={async () => {
                    const pending = await mobileNotificationService.getPendingNotifications();
                    if (pending.length > 0) {
                      toast.success(`${pending.length} notifications scheduled!`, {
                        description: `Next at: ${new Date(pending[0].schedule?.at).toLocaleTimeString()}`
                      });
                      console.log('Pending notifications:', pending);
                    } else {
                      toast.info('No notifications scheduled');
                    }
                  }}
                  variant="secondary"
                  className="w-full gap-2"
                >
                  🔍 Check Scheduled Notifications
                </Button>
              )}
              
              <p className="text-xs text-muted-foreground text-center">
                💡 Click "Save & Start" to enable reminders • "Stop All" to pause reminders
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestion Card */}
        <Card className="mt-8 border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <Droplet className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">💡 Hydration Tip</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your activity level, aim to drink water consistently throughout the day. 
                  Use the notification settings above to stay on track!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Water Reminder Modal */}
      <WaterReminderModal
        open={showReminderModal}
        onYes={handleModalYes}
        onNo={handleModalNo}
        servingSize={servingSize}
      />
    </div>
  );
};

export default Water;
