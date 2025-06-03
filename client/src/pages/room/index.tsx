import { useEffect } from "react";
import { redirect, useNavigate, useParams } from "react-router";
import { socket } from "@/lib/socket";
import useRemoteStreamStore from "@/store/remote-streams";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";

import useListenProducerUpdate from "@/hooks/useListenProducerUpdate";
import VideoDisplay from "./components/VideoDisplay";
import ControlBar from "./components/ControlBar";
import AudioStreams from "./components/AudioStreams";
import StatusBar from "./components/StatusBar";

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
      <StatusBar />
      <VideoDisplay />
      <AudioStreams />
      <ControlBar />
    </div>
  );
}
