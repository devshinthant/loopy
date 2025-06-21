import { CircleX, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import cleanUp from "@/lib/cleanUp";
import { useUser } from "@clerk/clerk-react";
import Microphone from "./Microphone";
import Camera from "./Camera";
import Speaker from "./Speaker";
import Participants from "./Participants";
import Share from "./Share";
import Reaction from "./Reaction";
import RaiseHand from "./RaiseHand";
import ChatSheet from "./ChatSheet";

export default function ControlBar() {
  const navigate = useNavigate();
  const params = useParams();
  const roomId = params.roomId as string;

  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="flex py-3 items-center justify-between border-t border-gray-800 bg-gray-950 px-[5%]">
      <div className="flex items-center gap-2">
        <Microphone />
        <Camera />
        <Speaker />
      </div>

      <div className="flex items-center gap-2">
        <Participants />
        <ChatSheet />
        <Share />
        <Reaction />
        <RaiseHand />
        <Button
          variant="outline"
          className="rounded-md border-gray-700 bg-gray-900 hover:bg-gray-800"
          onClick={() => {
            socket.emit("leave-room", { roomId, userId: user.id });
            cleanUp();
            navigate("/");
          }}
        >
          <LogOut className="h-5 w-5 text-white" />
          <p className="text-white text-xs">Leave</p>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="rounded-md hover:bg-red-900  bg-destructive"
          onClick={() => {
            socket.emit("end-room", { roomId });
            cleanUp();
            navigate("/");
          }}
        >
          <CircleX className="h-5 w-5 text-white" />
          <p className="text-white">End</p>
        </Button>
      </div>
    </div>
  );
}
