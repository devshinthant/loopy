import { Lock, Users } from "lucide-react";

import { Clock } from "lucide-react";
import RoomConnectionStatus from "./RoomConnectionStatus";

export default function StatusBar() {
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
            <h4 className="font-extrabold tracking-tight">John Doe</h4>
            <p className="text-xs font-medium text-gray-400">Host</p>
          </div>
        </div>

        {/* Right side - Status indicators */}
        <div className="flex items-center gap-15">
          {/* Meeting Duration */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-800/30 backdrop-blur-sm ring-1 ring-gray-700/30">
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200">2:30:45</span>
              <span className="text-xs text-gray-400">Duration</span>
            </div>
          </div>

          {/* Room ID */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-800/30 backdrop-blur-sm ring-1 ring-gray-700/30">
              <Lock className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200">
                Room: ABC123
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
                6 Online
              </span>
              <span className="text-xs text-gray-400">Participants</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
