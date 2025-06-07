import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useUserOptionsStore from "@/store/userOptions";
import { ChevronDown, Video, VideoOff } from "lucide-react";
import DeviceOptions from "./DeviceOptions";
import { useParams } from "react-router";
import useProducersStore from "@/store/producers";
import useLocalStreamStore from "@/store/local-streams";
import useTransportsStore from "@/store/transports";
import useSelectedDevicesStore from "@/store/selectedDevices";
import produce from "@/lib/produce";
import { socket } from "@/lib/socket";
import { useState } from "react";

export default function Camera() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { cameraOpened, setCameraOpened } = useUserOptionsStore();
  const { produceTransport } = useTransportsStore();
  const { localVideoStream, setLocalVideoStream } = useLocalStreamStore();
  const { selectedVideoInput } = useSelectedDevicesStore();
  const { videoProducer, setVideoProducer } = useProducersStore();

  const [videoConf, setVideoConf] = useState({
    encoding: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 },
  });

  const startCamera = async () => {
    if (!produceTransport) return;
    try {
      let stream = localVideoStream;

      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedVideoInput } },
        });
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
      setCameraOpened(true);
    } catch (error) {
      console.log(error);
    }
  };

  const stopCamera = () => {
    if (!produceTransport || !videoProducer || !localVideoStream) return;

    localVideoStream
      .getVideoTracks()
      .forEach((track) => (track.enabled = false));
    videoProducer.pause();
    socket.emit("producer-paused", {
      producerId: videoProducer.id,
      roomId,
      kind: "video",
    });
    setCameraOpened(false);
  };

  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={cameraOpened ? "default" : "outline"}
              size="icon"
              className={`rounded-l-full cursor-pointer ${
                cameraOpened
                  ? "bg-green-600 hover:bg-green-700"
                  : "border-gray-700 bg-gray-900 hover:bg-gray-800"
              }`}
              onClick={cameraOpened ? stopCamera : startCamera}
            >
              {cameraOpened ? (
                <Video className="h-5 w-5 text-white" />
              ) : (
                <VideoOff className="h-5 w-5 text-gray-300" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {cameraOpened ? "Turn off camera" : "Turn on camera"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={cameraOpened ? "default" : "outline"}
            size="icon"
            className={`rounded-r-full cursor-pointer border-l-0 ${
              cameraOpened
                ? "bg-green-600 hover:bg-green-700"
                : "border-gray-700 bg-gray-900 hover:bg-gray-800"
            }`}
          >
            <ChevronDown className="h-4 w-4 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 bg-gray-900 border border-gray-700">
          <DropdownMenuLabel className="text-gray-200! font-medium">
            Camera Settings
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          <div className="p-2">
            <DeviceOptions roomId={roomId} type="video" />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
