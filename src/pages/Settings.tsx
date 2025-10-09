import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings as SettingsIcon, User, Bell, Moon, Info } from "lucide-react";

const Settings = () => {
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
            <SettingsIcon className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Settings</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">App Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>

        {/* Profile */}
        <Card className="mb-6 border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="text-lg font-semibold">John Doe</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-lg font-semibold">john@example.com</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Age</Label>
                <p className="text-lg font-semibold">25 years</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Weight</Label>
                <p className="text-lg font-semibold">70 kg</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6 border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your alerts and reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="workout-reminder">Workout Reminders</Label>
                <p className="text-sm text-muted-foreground">Daily training notifications</p>
              </div>
              <Switch id="workout-reminder" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="water-reminder">Water Reminders</Label>
                <p className="text-sm text-muted-foreground">Hydration alerts</p>
              </div>
              <Switch id="water-reminder" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="meal-reminder">Meal Reminders</Label>
                <p className="text-sm text-muted-foreground">Diet plan notifications</p>
              </div>
              <Switch id="meal-reminder" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-6 border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the app theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Currently active</p>
              </div>
              <Switch id="dark-mode" defaultChecked disabled />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">App Version</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="font-semibold">2025.01.15</span>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Link to="/">
          <Button variant="destructive" className="w-full mt-8">
            Logout
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Settings;
