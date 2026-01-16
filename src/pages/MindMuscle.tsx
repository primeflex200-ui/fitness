import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Music, Play, Pause, SkipForward, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MindMuscle = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const playlist = [
    { title: "Eye of the Tiger", artist: "Survivor", bpm: 140, spotifyId: "2KH16WveTQWT6KOG9Rg6e2" },
    { title: "Lose Yourself", artist: "Eminem", bpm: 128, spotifyId: "5Z01UMMf7V1o0MzF86s6WJ" },
    { title: "Till I Collapse", artist: "Eminem", bpm: 135, spotifyId: "4xkOaSrkexMciUUogZKVTS" },
    { title: "Stronger", artist: "Kanye West", bpm: 145, spotifyId: "4fzsfWzRhPawzqhX8Qt9F3" },
    { title: "Remember the Name", artist: "Fort Minor", bpm: 130, spotifyId: "1lgN0A2Vki2AXBK8ewdEhf" },
    { title: "Can't Hold Us", artist: "Macklemore", bpm: 142, spotifyId: "3bidbhpOYeV4knp8AIu8Xn" },
    { title: "SICKO MODE", artist: "Travis Scott", bpm: 155, spotifyId: "2xLMifQCjDGFmkHkpNLD9h" },
    { title: "HUMBLE.", artist: "Kendrick Lamar", bpm: 150, spotifyId: "7KXjTSCq5nL1LoYtL7XAwS" },
    { title: "Goosebumps", artist: "Travis Scott", bpm: 130, spotifyId: "6gBFPUFcJLzWGx4lenP6h2" },
    { title: "Warrior", artist: "Kiiara", bpm: 120, spotifyId: "3qVHQWAVR51XfXaKSBDVG6" },
    { title: "Pump It", artist: "Endor", bpm: 128, spotifyId: "3VbCsYJMNK7Ywqm5c5BhNK" },
    { title: "Beast", artist: "5 Seconds of Summer", bpm: 140, spotifyId: "0DiWzAVjucZsgKjNU1xDVi" },
    { title: "Thunderstruck", artist: "AC/DC", bpm: 133, spotifyId: "57bgtoPSgt236HzfBOd8kj" },
    { title: "Enter Sandman", artist: "Metallica", bpm: 123, spotifyId: "1hKdDCpiI9mqz1jVHRKG0E" },
  ];

  const quotes = [
    "The only bad workout is the one you didn't do.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Success isn't always about greatness. It's about consistency.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Push harder than yesterday if you want a different tomorrow."
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Music className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">Mind-Muscle Connection</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Focus Your Mind, Fuel Your Body</h1>
          <p className="text-muted-foreground">Build mental focus and rhythm during your workout</p>
        </div>

        <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/10">
          <CardHeader className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
              <Music className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">{playlist[currentTrack].title}</CardTitle>
            <p className="text-muted-foreground">{playlist[currentTrack].artist}</p>
            <Badge variant="outline" className="mx-auto mt-2">{playlist[currentTrack].bpm} BPM</Badge>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <iframe key={currentTrack} style={{ borderRadius: '12px' }} src={`https://open.spotify.com/embed/track/${playlist[currentTrack].spotifyId}?utm_source=generator&theme=0`} width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full w-14 h-14" onClick={() => setCurrentTrack((currentTrack - 1 + playlist.length) % playlist.length)}>
                <SkipForward className="w-6 h-6 rotate-180" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full w-14 h-14" onClick={() => setCurrentTrack((currentTrack + 1) % playlist.length)}>
                <SkipForward className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle>Focus Mode</CardTitle>
              </div>
              <Button variant={focusMode ? "hero" : "outline"} onClick={() => setFocusMode(!focusMode)}>
                {focusMode ? "Active" : "Activate"}
              </Button>
            </div>
          </CardHeader>
          {focusMode && (
            <CardContent>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-center font-semibold text-primary">"{quotes[Math.floor(Math.random() * quotes.length)]}"</p>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workout Playlist ({playlist.length} tracks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {playlist.map((track, i) => (
                <div key={i} className={`p-3 rounded-lg cursor-pointer transition-all ${i === currentTrack ? "bg-primary/20 border border-primary/50" : "bg-muted/30 hover:bg-muted/50"}`} onClick={() => setCurrentTrack(i)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{track.title}</h4>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                    </div>
                    <Badge variant="outline">{track.bpm} BPM</Badge>
                  </div>
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
