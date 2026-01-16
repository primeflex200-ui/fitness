import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";

interface WaterReminderModalProps {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
  servingSize: number;
}

export const WaterReminderModal = ({ open, onYes, onNo, servingSize }: WaterReminderModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onNo()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Droplet className="w-10 h-10 text-cyan-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">💧 Hydration Time!</DialogTitle>
          <DialogDescription className="text-center text-lg pt-2">
            Time to drink some water. Stay hydrated!
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Did you drink your water?
          </p>
          <div className="text-3xl font-bold text-cyan-500 mb-2">
            {servingSize}ml
          </div>
          <p className="text-xs text-muted-foreground">
            Will be added to your daily intake
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onNo}
            variant="outline"
            className="flex-1"
          >
            ❌ Not Yet
          </Button>
          <Button
            onClick={onYes}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600"
          >
            ✅ Yes, I Drank Water
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
