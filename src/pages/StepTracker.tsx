import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Footprints, MapPin, Activity, Clock, Zap, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Progress as ProgressBar } from "@/components/ui/progress";

interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const StepTracker = () => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0); // in km
  const [duration, setDuration] = useState(0); // in seconds
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const DAILY_GOAL = 10000;
  const AVERAGE_STEP_LENGTH = 0.762; // meters (average adult step length)
  const MIN_DISTANCE_THRESHOLD = 0.02; // 20 meters minimum to count as real movement (filters GPS noise)
  const ACCURACY_THRESHOLD = 50; // Only use GPS points with accuracy better than 50 meters

  // Calculate distance between two GPS coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Start tracking with GPS
  const startTracking = async () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);
    setLocations([]);
    setTotalDistance(0);
    setTotalSteps(0);
    setDuration(0);
    startTimeRef.current = Date.now();
    toast.success("GPS Tracking started! Move your device to count steps 🚶");

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const initialLocation: LocationPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
        };
        setLocations([initialLocation]);
      },
      (error) => {
        toast.error("Unable to access GPS. Please enable location services.");
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Stop tracking
  const stopTracking = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    toast.success("Tracking stopped!");
  };

  // Reset steps
  const resetSteps = async () => {
    setTotalSteps(0);
    setTotalDistance(0);
    setLocations([]);
    setDuration(0);
    
    if (user) {
      try {
        await supabase
          .from("user_stats")
          .upsert({
            user_id: user.id,
            steps_today: 0,
            updated_at: new Date().toISOString(),
          });
        toast.success("Steps reset to 0!");
      } catch (error) {
        console.error("Error resetting steps:", error);
      }
    }
  };

  // Watch position while tracking
  useEffect(() => {
    if (isTracking) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          // Filter out inaccurate GPS readings
          if (position.coords.accuracy > ACCURACY_THRESHOLD) {
            console.log(`GPS accuracy too low: ${position.coords.accuracy}m, skipping`);
            return;
          }

          const newLocation: LocationPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
          };

          setLocations((prevLocations) => {
            if (prevLocations.length > 0) {
              const lastLocation = prevLocations[prevLocations.length - 1];
              const distanceKm = calculateDistance(
                lastLocation.latitude,
                lastLocation.longitude,
                newLocation.latitude,
                newLocation.longitude
              );

              // Only count if distance is significant (more than 20 meters - filters GPS noise)
              if (distanceKm > MIN_DISTANCE_THRESHOLD) {
                setTotalDistance((prev) => {
                  const newDistance = prev + distanceKm;
                  const calculatedSteps = Math.round((newDistance * 1000) / AVERAGE_STEP_LENGTH);
                  
                  setTotalSteps(calculatedSteps);

                  // Auto-reset at 10,000 steps
                  if (calculatedSteps >= DAILY_GOAL) {
                    toast.success("🎉 Congratulations! You reached 10,000 steps! Resetting...");
                    setTimeout(() => {
                      resetSteps();
                    }, 2000);
                  }

                  // Save to database
                  if (user) {
                    supabase
                      .from("user_stats")
                      .upsert({
                        user_id: user.id,
                        steps_today: calculatedSteps,
                        updated_at: new Date().toISOString(),
                      });
                  }

                  return newDistance;
                });
              }
            }

            return [...prevLocations, newLocation];
          });

          // Update duration
          if (startTimeRef.current) {
            setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("GPS error: " + error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (watchIdRef.current !== null && !isTracking) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTracking, user]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = Math.min((totalSteps / DAILY_GOAL) * 100, 100);

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
            <Footprints className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Step Tracker</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Step Tracker</h1>
          <p className="text-muted-foreground">Track your steps using GPS location</p>
        </div>

        {/* Main Stats Card */}
        <Card className="mb-6 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                Today's Activity
              </CardTitle>
              <Button
                onClick={resetSteps}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Steps Display */}
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{totalSteps.toLocaleString()}</div>
              <p className="text-muted-foreground mb-4">Steps Tracked</p>
              <ProgressBar value={(totalSteps / DAILY_GOAL) * 100} className="h-4 mb-2" />
              <p className="text-sm text-muted-foreground">
                {totalSteps >= DAILY_GOAL ? "🎉 Goal Reached!" : `${DAILY_GOAL - totalSteps} steps to go`}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-card/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Distance</p>
                <p className="text-2xl font-bold text-primary">{totalDistance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">km</p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Locations</p>
                <p className="text-2xl font-bold">{locations.length}</p>
                <p className="text-xs text-muted-foreground">GPS points</p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="text-2xl font-bold">{formatTime(duration)}</p>
                <p className="text-xs text-muted-foreground">hh:mm:ss</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Controls */}
        <Card className="mb-6 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {!isTracking ? (
                <>
                  <Button
                    onClick={startTracking}
                    variant="hero"
                    size="lg"
                    className="flex-1"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Start GPS Tracking
                  </Button>
                  <Button
                    onClick={resetSteps}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={stopTracking}
                    variant="destructive"
                    size="lg"
                    className="flex-1"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Stop Tracking
                  </Button>
                  <Badge variant="default" className="px-4 py-2 text-base animate-pulse">
                    🔴 LIVE GPS
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-primary/30 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">How GPS Step Tracking Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>✓ Real GPS tracking - only counts when you physically move</p>
            <p>✓ Minimum 5 meters movement required to register</p>
            <p>✓ Calculates distance using GPS coordinates (Haversine formula)</p>
            <p>✓ Converts distance to steps (76.2 cm average step length)</p>
            <p>✓ Auto-resets at 10,000 steps - new daily goal</p>
            <p>✓ Manual reset button available anytime</p>
            <p>✓ Saves to database in real-time</p>
            <p className="text-yellow-500 font-semibold">⚠️ Requires GPS enabled on your device</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StepTracker;
