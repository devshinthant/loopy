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
import handleProducer from "@/lib/handleProducer";
import setUpRouter from "@/lib/setUpRouter";
import createProduceTransport from "@/lib/createProduceTransport";

export default function Room() {
  const params = useParams();

  const location = useLocation();

  const roomId = params.roomId as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  const { setRtpCapabilities, setDevice, device, rtpCapabilities } =
    useRoomStore();
  const { setProduceTransport, setReceiveTransport, receiveTransport } =
    useTransportsStore();
  const { setVideoProducer } = useProducersStore();

  const [videoConf, setVideoConf] = useState({
    encoding: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 },
  });

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [disableCamera, setDisableCamera] = useState(false);

  const toggleCamera = async () => {
    if (!device) return;
    setIsCameraOn(!isCameraOn);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      let closureVideoConf;
      if (videoRef.current) {
        const track = stream.getVideoTracks()[0];
        videoRef.current.srcObject = stream;
        closureVideoConf = { ...videoConf, track };
        setVideoConf((current) => ({ ...current, track }));
      }

      if (!closureVideoConf) return;

      createProduceTransport({
        roomId,
        device,
        setProduceTransport,
        setVideoProducer,
        videoConfig: closureVideoConf,
      });
    } catch (error) {
      console.error(error);
    }
  };

  /* Load Router Setup */
  useEffect(() => {
    if (!roomId) return;
    setUpRouter({
      roomId,
      setRtpCapabilities,
      setDevice,
      setReceiveTransport,
    });
  }, [
    roomId,
    setRtpCapabilities,
    setDevice,
    setReceiveTransport,
    setDisableCamera,
  ]);

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
  }, [receiveTransport, roomId, rtpCapabilities]);

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
  }, [device, rtpCapabilities, receiveTransport, roomId, location.state.type]);

  if (!roomId) {
    redirect("/setup");
    return <div>Room not found</div>;
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <video ref={remoteRef} id="remotevideo" autoPlay playsInline />
      <video ref={videoRef} id="localvideo" autoPlay playsInline />

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
