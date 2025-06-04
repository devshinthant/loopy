import {
  ArrowUp,
  CircleX,
  Hand,
  LogOut,
  MessageCircle,
  Smile,
  Users,
  ChevronDown,
  Settings,
  Mic,
  MicOff,
  Video,
  VideoOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { TooltipProvider } from "@/components/ui/tooltip";
import useUserOptionsStore from "@/store/userOptions";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/clerk-react";

export default function ControlBar() {
  const params = useParams();
  const navigate = useNavigate();

  const roomId = params.roomId as string;

  const { device } = useRoomStore();
  const { user } = useUser();

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

  if (!user) return null;

  return (
    <div className="flex py-3 items-center justify-between border-t border-gray-800 bg-gray-950 px-[5%]">
      <div className="flex items-center gap-2">
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
            <DropdownMenuContent className="w-56 bg-gray-900 border border-gray-700">
              <DropdownMenuLabel className="text-gray-200! font-medium">
                Microphone Settings
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                <span>Audio Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
                <span>Select Input Device</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
                <span>Test Microphone</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
            <DropdownMenuContent className="w-56 bg-gray-900 border border-gray-700">
              <DropdownMenuLabel className="text-gray-200! font-medium">
                Camera Settings
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                <span>Video Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
                <span>Select Camera</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
                <span>Background Effects</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
                <span>Mirror Video</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-md cursor-pointer border-gray-700 bg-gray-900 hover:bg-gray-800"
            >
              <Users className="h-5 w-5 text-white" />
              <p className="text-white text-xs ml-2">6 Joined</p>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 bg-gray-900 border border-gray-700">
            <DropdownMenuLabel className="text-gray-200 font-medium flex items-center justify-between">
              <span>Participants</span>
              <span className="text-xs text-gray-400">6 online</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            <div className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem className="flex items-center gap-2 text-gray-200 hover:bg-gray-800! cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  JD
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white">John Doe</span>
                  <span className="text-xs text-gray-400">Host</span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-400">Speaking</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-gray-200 hover:bg-gray-800! cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  AS
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white">Alice Smith</span>
                  <span className="text-xs text-gray-400">Co-host</span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  <span className="text-xs text-gray-400">Muted</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-gray-200 hover:bg-gray-800! cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                  RJ
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white">Robert Johnson</span>
                  <span className="text-xs text-gray-400">Participant</span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-400">Speaking</span>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-gray-700" />
            <div className="p-2">
              <Button
                variant="outline"
                className="w-full border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200!"
              >
                Invite People
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          className="rounded-md border-gray-700 bg-gray-900 hover:bg-gray-800"
        >
          <MessageCircle className="h-5 w-5 text-white" />
          <p className="text-white text-xs">Chat</p>
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="rounded-md cursor-pointer hover:bg-green-600 bg-green-500"
              >
                <ArrowUp strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Share</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-md cursor-pointer border-gray-700 hover:bg-gray-800 bg-gray-900  transition-colors duration-200"
            >
              <Smile className="h-5 w-5 text-white transition-colors duration-200 " />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-900 border border-gray-700">
            <DropdownMenuLabel className="text-yellow-500">
              Reactions
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
              Send Hearts ❤️
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
              Send Applause 👏
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
              Send Celebration 🎉
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="rounded-md border-gray-700 hover:bg-gray-800 bg-gray-900 transition-colors duration-200"
              >
                <Hand className="h-5 w-5 text-white transition-colors duration-200 " />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <span className="text-amber-400">Raise Hand</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="outline"
          className="rounded-md border-gray-700 bg-gray-900 hover:bg-gray-800"
          onClick={() => {
            socket.emit("leave-room", { roomId, userId: user.id });
            cleanUp();
            navigate("/setup");
          }}
        >
          <LogOut className="h-5 w-5 text-white" />
          <p className="text-white text-xs">Leave</p>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="rounded-md hover:bg-red-900  bg-destructive"
          onClick={() => {
            socket.emit("end-room", { roomId });
            cleanUp();
            navigate("/setup");
          }}
        >
          <CircleX className="h-5 w-5 text-white" />
          <p className="text-white">End</p>
        </Button>
      </div>
    </div>
  );
}
