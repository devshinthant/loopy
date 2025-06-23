import { ChevronDown } from "lucide-react";

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
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { TooltipProvider } from "@/components/ui/tooltip";
import useUserOptionsStore from "@/store/userOptions";
import { Mic, MicOff } from "lucide-react";
import DeviceOptions from "./DeviceOptions";
import produce from "@/lib/produce";
import { socket } from "@/lib/socket";
import useTransportsStore from "@/store/transports";
import useLocalStreamStore from "@/store/local-streams";
import useSelectedDevicesStore from "@/store/selectedDevices";
import useProducersStore from "@/store/producers";
import { useParams } from "react-router";
import { toast } from "sonner";

export default function Microphone() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { micOpened, setMicOpened } = useUserOptionsStore();
  const { produceTransport } = useTransportsStore();
  const { localAudioStream, setLocalAudioStream } = useLocalStreamStore();
  const { selectedAudioInput } = useSelectedDevicesStore();
  const { audioProducer, setAudioProducer } = useProducersStore();

  /* Mic */
  const startMic = async () => {
    if (!produceTransport) return;
    try {
      let stream = localAudioStream;
      if (!stream) {
        // Only try exact device ID if we have a valid selection
        if (selectedAudioInput && selectedAudioInput.trim() !== "") {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: { deviceId: { exact: selectedAudioInput } },
            });
          } catch (error) {
            if (error instanceof OverconstrainedError) {
              console.warn(
                "Selected audio device not available, falling back to default"
              );
              toast.warning(
                "Selected microphone not available, using default microphone"
              );
              stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
              });
            } else {
              throw error;
            }
          }
        } else {
          // No device selected, use default
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
        }
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

      setMicOpened(true);
    } catch (error) {
      console.log(error);
      toast.error(
        "Failed to start microphone. Please check your microphone permissions."
      );
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
    setMicOpened(false);
  };
  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={micOpened ? "default" : "outline"}
              size="icon"
              className={`rounded-l-full cursor-pointer ${
                micOpened
                  ? "bg-green-600 hover:bg-green-700"
                  : "border-gray-700 bg-gray-900 hover:bg-gray-800"
              }`}
              onClick={!micOpened ? startMic : pauseMic}
            >
              {micOpened ? (
                <Mic className="h-5 w-5 text-white" />
              ) : (
                <MicOff className="h-5 w-5 text-gray-300" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {micOpened ? "Turn off mic" : "Turn on mic"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={micOpened ? "default" : "outline"}
            size="icon"
            className={`rounded-r-full cursor-pointer border-l-0 ${
              micOpened
                ? "bg-green-600 hover:bg-green-700"
                : "border-gray-700 bg-gray-900 hover:bg-gray-800"
            }`}
          >
            <ChevronDown className="h-4 w-4 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 bg-gray-900 border border-gray-700">
          <DropdownMenuLabel className="text-gray-200! font-medium">
            Microphone Settings
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          <div className="p-2">
            <DeviceOptions roomId={roomId} type="audio" />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
