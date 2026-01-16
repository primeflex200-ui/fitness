import { useCardioTimer } from "@/contexts/CardioTimerContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Play, Pause, X } from "lucide-react";

export const GlobalCardioTimer = () => {
  const { isRunning, time, startTimer, pauseTimer, formatTime } = useCardioTimer();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on cardio page (it has its own timer display)
  if (location.pathname === '/cardio' || time === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-primary via-orange-500 to-red-500 rounded-lg shadow-2xl border-2 border-white/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Timer Icon */}
          <Heart className={`w-5 h-5 text-white ${isRunning ? 'animate-pulse' : ''}`} />
          
          {/* Timer Display */}
          <div 
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/cardio')}
            title="Go to Cardio page"
          >
            <div className="text-white font-bold text-lg">{formatTime(time)}</div>
            <div className="text-white/80 text-xs">
              {isRunning ? 'Running' : 'Paused'}
            </div>
          </div>

          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 bg-white/20 hover:bg-white/30 text-white"
            onClick={(e) => {
              e.stopPropagation();
              if (isRunning) {
                pauseTimer();
              } else {
                startTimer();
              }
            }}
          >
            {isRunning ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
