import { Users, Clock } from "lucide-react";
import DeviceSettingPanel from "./components/DeviceSettingPanel";
import MainPreview from "./components/MainPreview";
import { useLocation } from "react-router";
import * as dateFns from "date-fns";

export default function Preview() {
  const { state } = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">Ready to join?</h1>
          <p className="text-gray-400 text-lg">Video Conference Room</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span>
                {dateFns.format(new Date(state.roomCreatedAt), "hh:mm a")} -{" "}
                {dateFns.format(
                  dateFns.addMinutes(new Date(state.roomCreatedAt), 30),
                  "hh:mm a"
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full">
              <Users className="w-4 h-4" />
              <span>
                {state.participantCount} participant
                {state.participantCount > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <MainPreview />
          <DeviceSettingPanel />
        </div>
      </div>
    </div>
  );
}
