import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Video, VideoOff } from "lucide-react";
import { VideoDisplay } from "./components/VideoDisplay";
import useSocketStore from "@/store/socket";
import { redirect, useParams } from "react-router";
import type {
  DtlsParameters,
  IceCandidate,
  IceParameters,
  RtpCapabilities,
  RtpParameters,
} from "mediasoup-client/types";
import { Device } from "mediasoup-client";
import useRoomStore from "@/store/room";
import useTransportsStore from "@/store/transports";
import useProducersStore from "@/store/producers";

export default function Room() {
  const params = useParams();
  const roomId = params.roomId as string;

  const videoRef = useRef<HTMLVideoElement>(null);

  const { setRtpCapabilities, setDevice, device, rtpCapabilities } =
    useRoomStore();
  const { socket } = useSocketStore();
  const { setProduceTransport, setReceiveTransport } = useTransportsStore();
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
  const [disableCamera, setDisableCamera] = useState(true);

  const toggleCamera = async () => {
    if (!socket || !device) return;
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

      socket.emit(
        "createTransport",
        { sender: true, roomId },
        async (params: {
          id: string;
          iceParameters: IceParameters;
          iceCandidates: IceCandidate[];
          dtlsParameters: DtlsParameters;
          error?: string;
        }) => {
          if (params.error) {
            console.error(params.error);
            return;
          }

          const transport = device.createSendTransport(params);
          setProduceTransport(transport);

          transport.on(
            "connect",
            async ({ dtlsParameters }, callback, errorBack) => {
              try {
                socket.emit("connectProducerTransport", {
                  dtlsParameters,
                  roomId,
                });
                callback();
              } catch (error) {
                errorBack(error as Error);
              }
            }
          );

          transport.on("produce", (params, callback, errorBack) => {
            const { kind, rtpParameters } = params;

            console.log("Producing");

            try {
              socket.emit(
                "transport-produce",
                { kind, rtpParameters, roomId },
                ({ id }: { id: string }) => {
                  console.log("Server producer created", { id });
                  callback({ id });
                }
              );
            } catch (error) {
              errorBack(error as Error);
            }
          });

          const localProducer = await transport.produce(closureVideoConf);
          setVideoProducer(localProducer);

          console.log("Local producer created", localProducer);
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  /* Load Router Setup */
  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit(
      "getRouterRtpCapabilities",
      { roomId },
      ({
        error,
        rtpCapabilities,
      }: {
        error: string;
        rtpCapabilities: RtpCapabilities;
      }) => {
        if (!error) {
          setRtpCapabilities(rtpCapabilities);

          const device = new Device();
          device.load({
            routerRtpCapabilities: rtpCapabilities,
          });
          setDevice(device);
          setDisableCamera(false);
        }
      }
    );
  }, [roomId, socket, setRtpCapabilities, setDevice]);

  /* Create Receive Transport */
  useEffect(() => {
    if (!socket || !roomId || !device) return;

    socket.emit(
      "createTransport",
      { sender: false, roomId },
      (params: {
        id: string;
        iceParameters: IceParameters;
        iceCandidates: IceCandidate[];
        dtlsParameters: DtlsParameters;
        error: string;
      }) => {
        if (params.error) {
          return console.log(params.error);
        }

        const transport = device.createRecvTransport(params);
        setReceiveTransport(transport);

        transport.on("connect", ({ dtlsParameters }, callback, errorBack) => {
          try {
            socket.emit(
              "connectConsumerTransport",
              {
                dtlsParameters,
                roomId,
              },
              (params: { message: string }) => {
                if (params.message) {
                  console.log(params.message);
                }
              }
            );
            callback();
          } catch (error) {
            errorBack(error as Error);
          }
        });
      }
    );
  }, [socket, roomId, device, setReceiveTransport, rtpCapabilities]);

  useEffect(() => {
    socket?.on("WTF", (data) => {
      console.log("Received producers from server:", data);
    });
  }, [socket, roomId, device]);

  if (!roomId) {
    redirect("/setup");
    return <div>Room not found</div>;
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* Main content area - can be extended with additional elements later */}
      <div className="flex flex-1 flex-col p-4">
        {/* Video display area */}
        <div className="relative flex flex-1 items-center justify-center rounded-lg bg-gray-900">
          <VideoDisplay isCameraOn={isCameraOn}>
            <video ref={videoRef} id="localvideo" autoPlay playsInline />
          </VideoDisplay>
        </div>
      </div>

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
