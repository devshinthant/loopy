import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut, Video, VideoOff } from "lucide-react";
import { redirect, useLocation, useNavigate, useParams } from "react-router";
import useRoomStore from "@/store/room";
import useTransportsStore from "@/store/transports";
import useProducersStore from "@/store/producers";
import { socket } from "@/lib/socket";
import handleConsume from "@/lib/handleConsume";
import produce from "@/lib/produce";
import useConsumersStore from "@/store/consumers";
import useLocalStreamStore from "@/store/local-streams";
import useRemoteStreamStore from "@/store/remote-streams";
import cleanUp from "@/lib/cleanUp";

export default function Room() {
  const params = useParams();
  const navigate = useNavigate();

  const location = useLocation();

  const roomId = params.roomId as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const { device, rtpCapabilities } = useRoomStore();

  /* Transports */
  const {
    receiveTransport,
    produceTransport,
    resetProduceTransport,
    resetReceiveTransport,
  } = useTransportsStore();

  /* Streams */
  const { setLocalVideoStream, localVideoStream, resetLocalVideoStream } =
    useLocalStreamStore();
  const {
    remoteStreams,
    addRemoteStream,
    pauseRemoteStream,
    resumeRemoteStream,
    resetRemoteStreams,
    removeRemoteStream,
  } = useRemoteStreamStore();

  /* Producers */
  const { setVideoProducer, videoProducer, resetVideoProducer } =
    useProducersStore();

  /* Consumers */
  const { addConsumer, consumers, resetConsumers } = useConsumersStore();

  const [videoConf, setVideoConf] = useState({
    encoding: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 },
  });

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [disableCamera] = useState(false);

  const startCamera = async () => {
    if (!produceTransport) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      setLocalVideoStream(stream);

      const tempVideoConf = { ...videoConf, track };
      setVideoConf((current) => ({ ...current, track }));

      if (videoProducer) {
        await videoProducer.replaceTrack({ track });
        videoProducer.resume();
        socket.emit("producer-resumed", {
          producerId: videoProducer.id,
          roomId,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }

      if (!videoProducer) {
        await produce({
          transport: produceTransport,
          trackConfig: tempVideoConf,
          setProducer: setVideoProducer,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const stopCamera = () => {
    if (!device || !produceTransport || !videoProducer || !localVideoStream)
      return;

    localVideoStream.getVideoTracks().forEach((track) => track.stop());
    videoProducer.pause();
    socket.emit("producer-paused", { producerId: videoProducer.id, roomId });
    setIsCameraOn(false);
  };

  /* Listen for producer updates */
  useEffect(() => {
    const onNewProducer = ({
      producerId,
      kind,
      type,
    }: {
      producerId: string;
      kind: string;
      type: "add" | "remove";
    }) => {
      if (type === "add") {
        handleConsume({
          roomId,
          producerId,
          kind,
          receiveTransport,
          rtpCapabilities,
          addConsumer,
          callback: (track) => {
            const stream = new MediaStream([track]);
            addRemoteStream({ stream, paused: false, producerId });
          },
        });
      } else {
        removeRemoteStream(producerId);
      }
    };

    socket.on("producer-update", onNewProducer);

    return () => {
      socket.off("producer-update", onNewProducer);
    };
  }, [
    receiveTransport,
    roomId,
    rtpCapabilities,
    addConsumer,
    addRemoteStream,
    removeRemoteStream,
  ]);

  /* Get Initial Producers */
  useEffect(() => {
    if (location.state.type === "create") return;
    if (!device || !rtpCapabilities || !receiveTransport) return;

    const handleGetOtherProducers = ({
      producers,
    }: {
      producers: string[];
    }) => {
      console.log({ producers }, "initial producers");
      producers.forEach((producerId) => {
        handleConsume({
          roomId,
          producerId,
          kind: "video",
          receiveTransport,
          rtpCapabilities,
          addConsumer,
          callback: (track) => {
            const stream = new MediaStream([track]);
            addRemoteStream({ stream, paused: false, producerId });
          },
        });
      });
    };
    socket.on("getOtherProducers", handleGetOtherProducers);

    return () => {
      socket.off("getOtherProducers", handleGetOtherProducers);
    };
  }, [
    device,
    rtpCapabilities,
    receiveTransport,
    roomId,
    location.state.type,
    addConsumer,
    addRemoteStream,
  ]);

  /* Handle Pause/Resume */
  useEffect(() => {
    if (!remoteStreams) return;

    const handlePeerProducerPaused = ({
      producerId,
    }: {
      producerId: string;
    }) => {
      console.log({ producerId }, "peer producer paused");
      pauseRemoteStream(producerId);
    };

    const handlePeerProducerResumed = ({
      producerId,
    }: {
      producerId: string;
    }) => {
      console.log({ producerId }, "peer producer resumed");
      resumeRemoteStream(producerId);
    };

    socket.on("peer-producer-paused", handlePeerProducerPaused);
    socket.on("peer-producer-resumed", handlePeerProducerResumed);

    return () => {
      socket.off("peer-producer-paused", handlePeerProducerPaused);
      socket.off("peer-producer-resumed", handlePeerProducerResumed);
    };
  }, [remoteStreams, pauseRemoteStream, resumeRemoteStream]);

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
        !videoProducer
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

      <video ref={videoRef} id="localvideo" autoPlay playsInline />

      <audio ref={remoteAudioRef} autoPlay playsInline />
      <audio ref={audioRef} autoPlay playsInline />

      {/* Control bar - can be extended with additional controls later */}
      <div className="flex h-16 items-center justify-center border-t border-gray-800 bg-gray-950 px-4">
        <div className="flex items-center gap-2">
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
              alert("hit");
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
              alert("hit");

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
