import { Monitor, Maximize2, Minimize2 } from "lucide-react";
import useLocalStreamStore from "@/store/local-streams";
import { useUser } from "@clerk/clerk-react";
import useRemoteScreenStreamStore from "@/store/remote-screen-stream";
import { useParticipantsStore } from "@/store/participants";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function SharingParticipantBar() {
  const { localScreenStream } = useLocalStreamStore();
  const { user } = useUser();
  const { remoteScreenStream } = useRemoteScreenStreamStore();
  const { participants } = useParticipantsStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const remoteSharingParticipant = participants.find(
    (participant) => participant.id === remoteScreenStream?.emitterId
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (!localScreenStream && !remoteScreenStream) return null;

  return (
    <div className="w-full mb-4 bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-lg p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {localScreenStream && user && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={user.imageUrl}
                  alt="avatar"
                  className="w-8 h-8 rounded-full ring-2 ring-gray-800"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <Monitor className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">You</p>
                  <span className="text-xs text-gray-400">
                    are sharing your screen
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>
            </div>
          )}

          {remoteScreenStream && remoteSharingParticipant && (
            <div className="flex items-center gap-3">
              {localScreenStream && <div className="w-px h-8 bg-gray-800" />}
              <div className="relative">
                <img
                  src={remoteSharingParticipant.imageUrl}
                  alt="avatar"
                  className="w-8 h-8 rounded-full ring-2 ring-gray-800"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <Monitor className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">
                    {remoteSharingParticipant.name}
                  </p>
                  <span className="text-xs text-gray-400">
                    is sharing the screen
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-800/50"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 text-gray-400" />
            ) : (
              <Maximize2 className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
