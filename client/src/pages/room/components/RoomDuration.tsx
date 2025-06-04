import { useRoomTimer } from "@/hooks/useRoomTimer";
import { Clock } from "lucide-react";
import { useLocation } from "react-router";

export default function RoomDuration() {
  const { state } = useLocation();
  const roomCreatedAt = state.roomCreatedAt;

  const roomDuration = useRoomTimer(roomCreatedAt);

  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-gray-800/30 backdrop-blur-sm ring-1 ring-gray-700/30">
        <Clock className="h-4 w-4 text-blue-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-200">
          {roomDuration}
        </span>
        <span className="text-xs text-gray-400">Duration</span>
      </div>
    </div>
  );
}
