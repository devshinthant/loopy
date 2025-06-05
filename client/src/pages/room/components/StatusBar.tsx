import { Lock, Users } from "lucide-react";

import RoomConnectionStatus from "./RoomConnectionStatus";
import { useParticipantsStore } from "@/store/participants";
import { useLocation, useParams } from "react-router";
import RoomDuration from "./RoomDuration";
import { UserButton, useUser } from "@clerk/clerk-react";

export default function StatusBar() {
  const { state } = useLocation();
  const { roomId } = useParams();
  const { user } = useUser();
  const { participants: onlineParticipants } = useParticipantsStore();
  const hostName = state.type === "create" ? "You" : state.hostName;

  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
      className="bg-gradient-to-l from-black via-gray-900 to-black py-4 px-[5%]  text-white  w-full"
    >
      <div className="flex items-center justify-between">
        {/* Left side - User info */}
        <div className="flex items-center gap-4">
          <div className="w-3.5 h-3.5 rounded-full bg-green-400"></div>
          <div className="flex flex-col items-start">
            <h4 className="font-extrabold tracking-tight">{hostName}</h4>
            <p className="text-xs font-medium text-gray-400">Host</p>
          </div>
        </div>

        {/* Right side - Status indicators */}
        <div className="flex items-center gap-15">
          <RoomDuration />

          {/* Room ID */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-800/30 backdrop-blur-sm ring-1 ring-gray-700/30">
              <Lock className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200">
                Room: {roomId}
              </span>
              <span className="text-xs text-gray-400">Secure</span>
            </div>
          </div>

          <RoomConnectionStatus />

          {/* Participant Count */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-800/30 backdrop-blur-sm ring-1 ring-gray-700/30">
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200">
                {onlineParticipants.length + 1} Online
              </span>
              <span className="text-xs text-gray-400">Participants</span>
            </div>
          </div>

          <div className="w-fit h-fit">{user ? <UserButton /> : null}</div>
        </div>
      </div>
    </div>
  );
}
