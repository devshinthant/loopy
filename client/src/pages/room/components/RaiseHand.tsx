import { TooltipContent } from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { TooltipTrigger } from "@/components/ui/tooltip";

import { Tooltip } from "@/components/ui/tooltip";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Hand } from "lucide-react";
import { socket } from "@/lib/socket";
import { useParams } from "react-router";
import useRaiseHandStore from "@/store/raiseHand";
import { useUser } from "@clerk/clerk-react";
import useObserveHands from "@/hooks/useObserveHands";

export default function RaiseHand() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { user } = useUser();
  const { addRaisedHand, isHandRaised, removeRaisedHand } = useRaiseHandStore();

  const handleRaiseHand = () => {
    if (!user) return;

    if (isHandRaised(user.id)) {
      socket.emit("lower-hand", { roomId }, ({ id }: { id: string }) => {
        removeRaisedHand(id);
      });
      return;
    }

    socket.emit("raise-hand", { roomId }, ({ id }: { id: string }) => {
      addRaisedHand(id);
    });
  };

  useObserveHands();

  if (!user) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="rounded-md border-gray-700 hover:bg-gray-800 bg-gray-900 transition-colors duration-200"
            onClick={handleRaiseHand}
          >
            {isHandRaised(user.id) ? (
              <Hand className="h-5 w-5 text-white  fill-yellow-500 transition-colors duration-200" />
            ) : (
              <Hand className="h-5 w-5 text-white  transition-colors duration-200" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <span className="text-amber-400">Raise Hand</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
