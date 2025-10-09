import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Music, Play, Pause, SkipForward, Brain, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const MindMuscle = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [volume, setVolume] = useState(0.7);

  const playlist = [
    { title: "Dia Delica", artist: "Workout Vibes", bpm: 140, url: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3" },
    { title: "Move Groove", artist: "Fitness Beats", bpm: 128, url: "https://assets.mixkit.co/music/preview/mixkit-getting-ready-for-the-show-124.mp3" },
    { title: "Flex It Out", artist: "Gym Warriors", bpm: 135, url: "https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3" },
    { title: "Power Surge", artist: "Elite Training", bpm: 145, url: "https://assets.mixkit.co/music/preview/mixkit-raise-me-up-122.mp3" },
    { title: "Iron Will", artist: "Strong Minds", bpm: 130, url: "https://assets.mixkit.co/music/preview/mixkit-in-the-zone-132.mp3" },
    { title: "Beast Mode", artist: "Muscle Music", bpm: 142, url: "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-131.mp3" }
  ];

  const motivationalQuotes = [
    "The only bad workout is the one you didn't do.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Success isn't always about greatness. It's about consistency.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Push harder than yesterday if you want a different tomorrow."
  ];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        toast.info("Music paused");
      } else {
        audioRef.current.play().catch(err => {
          console.error("Playback error:", err);
          toast.error("Unable to play audio");
        });
        toast.success("Now playing: " + playlist[currentTrack].title);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    const newTrack = (currentTrack + 1) % playlist.length;
    setCurrentTrack(newTrack);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
    toast.info(`Next: ${playlist[newTrack].title}`);
  };

  const selectTrack = (index: number) => {
    if (index !== currentTrack) {
      setCurrentTrack(index);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.load();
      }
      toast.info(`Selected: ${playlist[index].title}`);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

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
            <Music className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Mind-Muscle Connection</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hidden Audio Element */}
        <audio 
          ref={audioRef} 
          src={playlist[currentTrack].url}
          onEnded={nextTrack}
        />
        
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Focus Your Mind, Fuel Your Body</h1>
          <p className="text-muted-foreground">Build mental focus and rhythm during your workout</p>
        </div>

        {/* Now Playing */}
        <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center animate-glow-pulse">
              <Music className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">{playlist[currentTrack].title}</CardTitle>
            <CardDescription className="text-lg">{playlist[currentTrack].artist}</CardDescription>
            <Badge variant="outline" className="mx-auto mt-2">
              {playlist[currentTrack].bpm} BPM
            </Badge>
          </CardHeader>
          <CardContent>
            {/* Visualizer */}
            <div className="flex justify-center gap-1 mb-6 h-20">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 bg-primary rounded-full transition-all ${
                    isPlaying ? "animate-pulse" : "opacity-30"
                  }`}
                  style={{
                    height: `${isPlaying ? Math.random() * 100 : 20}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-14 h-14"
                onClick={nextTrack}
              >
                <SkipForward className="w-6 h-6" />
              </Button>
              <Button
                variant="hero"
                size="icon"
                className="rounded-full w-16 h-16"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-14 h-14"
                onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.7)}
                title={`Volume: ${Math.round(volume * 100)}%`}
              >
                <Volume2 className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Focus Mode */}
        <Card className="mb-8 border-border bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Focus Mode
                </CardTitle>
                <CardDescription>
                  Disable notifications and distractions
                </CardDescription>
              </div>
              <Button
                variant={focusMode ? "hero" : "outline"}
                onClick={toggleFocusMode}
              >
                {focusMode ? "Active" : "Activate"}
              </Button>
            </div>
          </CardHeader>
          {focusMode && (
            <CardContent>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-center font-semibold text-primary">
                  "{motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}"
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Playlist */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Workout Playlist</CardTitle>
            <CardDescription>Curated tracks to power your training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {playlist.map((track, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${
                    i === currentTrack
                      ? "bg-primary/20 border border-primary/50"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                  onClick={() => selectTrack(i)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                      {i === currentTrack && isPlaying ? (
                        <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                      ) : (
                        <Music className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{track.title}</h4>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{track.bpm} BPM</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MindMuscle;
