import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { redirect, useNavigate, useParams } from "react-router";
import useRoomStore from "@/store/room";
import useTransportsStore from "@/store/transports";
import useProducersStore from "@/store/producers";
import { socket } from "@/lib/socket";
import produce from "@/lib/produce";
import useConsumersStore from "@/store/consumers";
import useLocalStreamStore from "@/store/local-streams";
import useRemoteStreamStore from "@/store/remote-streams";
import cleanUp from "@/lib/cleanUp";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";
import useUserOptionsStore from "@/store/userOptions";

import useListenProducerUpdate from "@/hooks/useListenProducerUpdate";
export default function Room() {
  const params = useParams();
  const navigate = useNavigate();

  const roomId = params.roomId as string;

  const { device } = useRoomStore();

  /* Transports */
  const {
    receiveTransport,
    produceTransport,
    resetProduceTransport,
    resetReceiveTransport,
  } = useTransportsStore();

  /* Local Streams */
  const {
    setLocalVideoStream,
    localVideoStream,
    resetLocalVideoStream,
    localAudioStream,
    setLocalAudioStream,
    resetLocalAudioStream,
  } = useLocalStreamStore();

  /* Remote Video Streams */
  const {
    remoteStreams,
    pauseRemoteStream,
    resumeRemoteStream,
    resetRemoteStreams,
  } = useRemoteStreamStore();

  /* Remote Audio Streams */
  const {
    remoteAudioStreams,
    pauseRemoteAudioStream,
    resumeRemoteAudioStream,
    resetRemoteAudioStreams,
  } = useRemoteAudioStreamStore();

  /* Producers */
  const {
    setVideoProducer,
    videoProducer,
    resetVideoProducer,
    audioProducer,
    setAudioProducer,
    resetAudioProducer,
  } = useProducersStore();

  /* Consumers */
  const { consumers, resetConsumers } = useConsumersStore();

  const [videoConf, setVideoConf] = useState({
    encoding: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 },
  });

  const {
    micOpened: isMicOn,
    setMicOpened: setIsMicOn,
    cameraOpened: isCameraOn,
    setCameraOpened: setIsCameraOn,
  } = useUserOptionsStore();

  const [disableCamera] = useState(false);

  /* Camera */
  const startCamera = async () => {
    if (!produceTransport) return;
    try {
      let stream = localVideoStream;

      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setLocalVideoStream(stream);
      }

      const track = stream.getVideoTracks()[0];
      track.enabled = true;

      const tempVideoConf = { ...videoConf, track };
      setVideoConf((current) => ({ ...current, track }));

      if (videoProducer) {
        await videoProducer.replaceTrack({ track });
        videoProducer.resume();
        socket.emit("producer-resumed", {
          producerId: videoProducer.id,
          roomId,
          kind: "video",
        });
      } else {
        await produce({
          transport: produceTransport,
          trackConfig: tempVideoConf,
          setProducer: setVideoProducer,
        });
      }
      setIsCameraOn(true);
    } catch (error) {
      console.log(error);
    }
  };

  const stopCamera = () => {
    if (!device || !produceTransport || !videoProducer || !localVideoStream)
      return;

    localVideoStream
      .getVideoTracks()
      .forEach((track) => (track.enabled = false));
    videoProducer.pause();
    socket.emit("producer-paused", {
      producerId: videoProducer.id,
      roomId,
      kind: "video",
    });
    setIsCameraOn(false);
  };

  /* Mic */
  const startMic = async () => {
    if (!produceTransport) return;
    try {
      let stream = localAudioStream;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setLocalAudioStream(stream);
      }
      const track = stream.getAudioTracks()[0];
      track.enabled = true;

      if (audioProducer) {
        await audioProducer.replaceTrack({ track });
        audioProducer.resume();
        socket.emit("producer-resumed", {
          producerId: audioProducer.id,
          roomId,
          kind: "audio",
        });
      } else {
        await produce({
          transport: produceTransport,
          trackConfig: { track },
          setProducer: setAudioProducer,
        });
      }

      setIsMicOn(true);
    } catch (error) {
      console.log(error);
    }
  };

  const pauseMic = () => {
    if (!localAudioStream || !audioProducer) {
      return console.log("no local audio stream or audio producer");
    }
    localAudioStream
      .getAudioTracks()
      .forEach((track) => (track.enabled = false));
    audioProducer.pause();
    socket.emit("producer-paused", {
      producerId: audioProducer.id,
      roomId,
      kind: "audio",
    });
    setIsMicOn(false);
  };

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

  /* Clean Up */
  useEffect(() => {
    return () => {
      if (
        !produceTransport ||
        !receiveTransport ||
        !localVideoStream ||
        !remoteStreams ||
        !videoProducer ||
        !localAudioStream ||
        !remoteAudioStreams ||
        !audioProducer
      )
        return;

      cleanUp({
        produceTransport,
        resetProduceTransport,
        receiveTransport,
        resetReceiveTransport,
        localVideoStream,
        resetLocalVideoStream,
        remoteStreams,
        resetRemoteStreams,
        videoProducer,
        resetVideoProducer,
        consumers,
        resetConsumers,
        localAudioStream,
        resetLocalAudioStream,
        remoteAudioStreams,
        resetRemoteAudioStreams,
        audioProducer,
        resetAudioProducer,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!roomId) {
    redirect("/setup");
    return <div>Room not found</div>;
  }

  return (
    <div className="flex  w-full flex-col overflow-hidden">
      {remoteStreams?.map(({ stream, paused }) => (
        <div key={stream.id} style={{ position: "relative" }}>
          {!paused && (
            <video
              ref={(el) => {
                if (el) el.srcObject = stream;
              }}
              autoPlay
              playsInline
              muted={false}
              style={{
                width: "300px",
                filter: paused ? "grayscale(100%) brightness(0.5)" : "none",
              }}
            />
          )}

          {paused && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                color: "white",
                fontSize: "1.2rem",
              }}
            >
              Camera Off
            </div>
          )}
        </div>
      ))}

      <video
        ref={(el) => {
          if (el) el.srcObject = localVideoStream;
        }}
        id="localvideo"
        autoPlay
        playsInline
      />

      {remoteAudioStreams?.map(({ stream }) => (
        <audio
          key={stream.id}
          autoPlay
          controls
          ref={(el) => {
            if (el) {
              el.srcObject = stream;
            }
          }}
        />
      ))}

      {/* Control bar - can be extended with additional controls later */}
      <div className="flex h-16 items-center justify-center border-t border-gray-800 bg-gray-950 px-4">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isMicOn ? "default" : "outline"}
                  size="icon"
                  className={`rounded-full ${
                    isMicOn
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-gray-700 bg-gray-900 hover:bg-gray-800"
                  }`}
                  onClick={!isMicOn ? startMic : pauseMic}
                >
                  {isMicOn ? (
                    <Mic className="h-5 w-5 text-white" />
                  ) : (
                    <MicOff className="h-5 w-5 text-gray-300" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isMicOn ? "Turn off mic" : "Turn on mic"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={disableCamera}
                  variant={isCameraOn ? "default" : "outline"}
                  size="icon"
                  className={`rounded-full ${
                    isCameraOn
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-gray-700 bg-gray-900 hover:bg-gray-800"
                  }`}
                  onClick={isCameraOn ? stopCamera : startCamera}
                >
                  {isCameraOn ? (
                    <Video className="h-5 w-5 text-white" />
                  ) : (
                    <VideoOff className="h-5 w-5 text-gray-300" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isCameraOn ? "Turn off camera" : "Turn on camera"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            onClick={() => {
              socket.emit("end-room", { roomId });
              navigate("/setup");
            }}
          >
            End Room
            <LogOut className="h-5 w-5 text-gray-300" />
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              socket.emit("leave-room", { roomId });
              navigate("/setup");
            }}
          >
            Leave Room
          </Button>
        </div>
      </div>
    </div>
  );
}
