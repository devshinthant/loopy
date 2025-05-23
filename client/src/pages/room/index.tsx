import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Video, VideoOff } from "lucide-react";
import { redirect, useLocation, useParams } from "react-router";
import useRoomStore from "@/store/room";
import useTransportsStore from "@/store/transports";
import useProducersStore from "@/store/producers";
import { socket } from "@/lib/socket";
import handleProducer from "@/lib/handleConsume";
import produce from "@/lib/produce";
import useConsumersStore from "@/store/consumers";

export default function Room() {
  const params = useParams();

  const location = useLocation();

  const roomId = params.roomId as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const remoteRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const { device, rtpCapabilities } = useRoomStore();
  const { receiveTransport, produceTransport } = useTransportsStore();
  const { setVideoProducer } = useProducersStore();
  const { addConsumer } = useConsumersStore();

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

  const toggleCamera = async () => {
    if (!device || !produceTransport) return;
    setIsCameraOn(!isCameraOn);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      let tempVideoConf;
      if (videoRef.current) {
        const track = stream.getVideoTracks()[0];
        videoRef.current.srcObject = stream;
        tempVideoConf = { ...videoConf, track };
        setVideoConf((current) => ({ ...current, track }));

        await produce({
          transport: produceTransport,
          trackConfig: tempVideoConf,
          setProducer: setVideoProducer,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* Listen for new producer */
  useEffect(() => {
    const onNewProducer = ({
      producerId,
      kind,
    }: {
      producerId: string;
      kind: string;
    }) => {
      handleProducer({
        roomId,
        producerId,
        kind,
        receiveTransport,
        rtpCapabilities,
        addConsumer,
        callback: (track) => {
          if (remoteRef.current) {
            remoteRef.current.srcObject = new MediaStream([track]);
          }
        },
      });
    };

    socket.on("new-producer", onNewProducer);

    return () => {
      socket.off("new-producer", onNewProducer);
    };
  }, [receiveTransport, roomId, rtpCapabilities, addConsumer]);

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
        handleProducer({
          roomId,
          producerId,
          kind: "video",
          receiveTransport,
          rtpCapabilities,
          addConsumer,
          callback: (track) => {
            if (remoteRef.current) {
              remoteRef.current.srcObject = new MediaStream([track]);
            }
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
  ]);

  if (!roomId) {
    redirect("/setup");
    return <div>Room not found</div>;
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <video ref={remoteRef} id="remotevideo" autoPlay playsInline />
      <video ref={videoRef} id="localvideo" autoPlay playsInline />

      <audio ref={remoteAudioRef} autoPlay playsInline />
      <audio ref={audioRef} autoPlay playsInline />

      {/* Main content area - can be extended with additional elements later */}

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
                  onClick={toggleCamera}
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
        </div>
      </div>
    </div>
  );
}
