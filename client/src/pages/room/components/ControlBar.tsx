import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { TooltipProvider } from "@/components/ui/tooltip";
import { MicOff, Video, VideoOff } from "lucide-react";
import useUserOptionsStore from "@/store/userOptions";
import { Mic } from "lucide-react";
import { socket } from "@/lib/socket";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import useLocalStreamStore from "@/store/local-streams";
import useTransportsStore from "@/store/transports";
import { useState } from "react";
import useProducersStore from "@/store/producers";
import produce from "@/lib/produce";
import useRoomStore from "@/store/room";
import cleanUp from "@/lib/cleanUp";

export default function ControlBar() {
  const params = useParams();
  const navigate = useNavigate();

  const roomId = params.roomId as string;

  const { device } = useRoomStore();

  const { micOpened, cameraOpened, setCameraOpened, setMicOpened } =
    useUserOptionsStore();

  const [videoConf, setVideoConf] = useState({
    encoding: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 },
  });

  const {
    localVideoStream,
    setLocalVideoStream,
    localAudioStream,
    setLocalAudioStream,
  } = useLocalStreamStore();
  const { produceTransport } = useTransportsStore();

  const { videoProducer, setVideoProducer, audioProducer, setAudioProducer } =
    useProducersStore();

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
      setCameraOpened(true);
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
    setCameraOpened(false);
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

      setMicOpened(true);
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
    setMicOpened(false);
  };

  return (
    <div className="flex h-16 items-center justify-center border-t border-gray-800 bg-gray-950 px-4">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={micOpened ? "default" : "outline"}
                size="icon"
                className={`rounded-full ${
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={cameraOpened ? "default" : "outline"}
                size="icon"
                className={`rounded-full ${
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

        <Button
          variant="outline"
          onClick={() => {
            socket.emit("end-room", { roomId });
            cleanUp();
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
            cleanUp();
            navigate("/setup");
          }}
        >
          Leave Room
        </Button>
      </div>
    </div>
  );
}
