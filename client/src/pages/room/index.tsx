import { useEffect } from "react";
import { redirect, useNavigate, useParams } from "react-router";
import { socket } from "@/lib/socket";
import useRemoteStreamStore from "@/store/remote-streams";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";

import useListenProducerUpdate from "@/hooks/useListenProducerUpdate";
import VideoDisplay from "./components/VideoDisplay";
import ControlBar from "./components/ControlBar";
import AudioStreams from "./components/AudioStreams";
import { Clock, Users, Wifi, Lock } from "lucide-react";

export default function Room() {
  const params = useParams();
  const navigate = useNavigate();

  const roomId = params.roomId as string;

  /* Remote Video Streams */
  const { remoteStreams, pauseRemoteStream, resumeRemoteStream } =
    useRemoteStreamStore();

  /* Remote Audio Streams */
  const { pauseRemoteAudioStream, resumeRemoteAudioStream } =
    useRemoteAudioStreamStore();

  useListenProducerUpdate({
    roomId,
  });

  /* Handle Pause/Resume */
  useEffect(() => {
    if (!remoteStreams) return;

    const handlePeerProducerPaused = ({
      producerId,
      kind,
    }: {
      producerId: string;
      kind: "audio" | "video";
    }) => {
      console.log({ producerId, kind }, "peer producer paused");
      if (kind === "video") {
        pauseRemoteStream(producerId);
      }
      if (kind === "audio") {
        pauseRemoteAudioStream(producerId);
      }
    };

    const handlePeerProducerResumed = ({
      producerId,
      kind,
    }: {
      producerId: string;
      kind: "audio" | "video";
    }) => {
      console.log({ producerId }, "peer producer resumed");
      if (kind === "video") {
        resumeRemoteStream(producerId);
      }
      if (kind === "audio") {
        resumeRemoteAudioStream(producerId);
      }
    };

    socket.on("peer-producer-paused", handlePeerProducerPaused);
    socket.on("peer-producer-resumed", handlePeerProducerResumed);

    return () => {
      socket.off("peer-producer-paused", handlePeerProducerPaused);
      socket.off("peer-producer-resumed", handlePeerProducerResumed);
    };
  }, [
    remoteStreams,
    pauseRemoteStream,
    resumeRemoteStream,
    resumeRemoteAudioStream,
    pauseRemoteAudioStream,
  ]);

  /* End Room */
  useEffect(() => {
    const handleEndRoom = () => {
      navigate("/setup");
    };
    socket.on("room-ended", handleEndRoom);

    return () => {
      socket.off("room-ended", handleEndRoom);
    };
  }, [navigate]);

  if (!roomId) {
    redirect("/setup");
    return <div>Room not found</div>;
  }

  return (
    <div className="flex w-full h-full flex-col overflow-hidden">
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
                <span className="text-sm font-medium text-gray-200">
                  2:30:45
                </span>
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

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-500/10 backdrop-blur-sm ring-1 ring-green-500/20">
                <Wifi className="h-4 w-4 text-green-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-200">Good</span>
                <span className="text-xs text-gray-400">Connection</span>
              </div>
            </div>

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

      <VideoDisplay />
      <AudioStreams />
      <ControlBar />
    </div>
  );
}
