import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useListenProducerUpdate from "@/hooks/useListenProducerUpdate";
import handleConsume from "@/lib/handleConsume";
import produce from "@/lib/produce";
import { socket } from "@/lib/socket";
import useLocalStreamStore from "@/store/local-streams";
import { useParticipantsStore } from "@/store/participants";
import useProducersStore from "@/store/producers";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";
import useRemoteStreamStore from "@/store/remote-streams";
import useRoomStore from "@/store/room";
import useSelectedDevicesStore from "@/store/selectedDevices";
import useTransportsStore from "@/store/transports";
import useUserOptionsStore from "@/store/userOptions";
import { useUser } from "@clerk/clerk-react";
import {
  Mic,
  MicOff,
  Monitor,
  Phone,
  Settings,
  User,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

export default function MainPreview() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { user } = useUser();

  const roomId = state.roomId;

  const { cameraOpened, micOpened, setCameraOpened, setMicOpened } =
    useUserOptionsStore();

  const { produceTransport } = useTransportsStore();

  const { setVideoProducer, setAudioProducer } = useProducersStore();

  const { device, rtpCapabilities } = useRoomStore();

  const { receiveTransport } = useTransportsStore();

  const {
    localVideoStream,
    setLocalVideoStream,
    localAudioStream,
    setLocalAudioStream,
  } = useLocalStreamStore();

  const { addRemoteStream } = useRemoteStreamStore();

  const { addRemoteAudioStream } = useRemoteAudioStreamStore();

  const { selectedAudioInput, selectedVideoInput } = useSelectedDevicesStore();

  const handleCameraOpen = async () => {
    let stream = localVideoStream;

    if (stream) {
      stream.getTracks().forEach((track) => (track.enabled = true));
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        video: selectedVideoInput
          ? { deviceId: { exact: selectedVideoInput } }
          : true,
      });
      setLocalVideoStream(stream);
    }

    setCameraOpened(true);
  };

  const handleCameraClose = () => {
    if (!localVideoStream) return;
    const tracks = localVideoStream.getTracks();
    tracks.forEach((track) => (track.enabled = false));
    setCameraOpened(false);
  };

  const handleMicOpen = async () => {
    let stream = localAudioStream;
    if (stream) {
      stream.getTracks().forEach((track) => (track.enabled = true));
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedAudioInput
          ? { deviceId: { exact: selectedAudioInput } }
          : true,
      });
      setLocalAudioStream(stream);
    }
    setMicOpened(true);
  };

  const handleMicClose = () => {
    if (!localAudioStream) return;
    localAudioStream.getTracks().forEach((track) => (track.enabled = false));
    setMicOpened(false);
  };

  const { setParticipants } = useParticipantsStore();

  async function handleJoinRoom() {
    if (!user) return;
    socket.emit("giveMeOthers", {
      roomId: state.roomId,
    });
    socket.emit(
      "enter-room",
      {
        roomId: state.roomId,
        userData: {
          id: user.id,
          name: user.fullName,
          email: user.emailAddresses[0].emailAddress,
          imageUrl: user.imageUrl,
        },
      },
      async ({ message, hostName }: { message: string; hostName: string }) => {
        toast.message(message);

        socket.emit(
          "get-initial-participants",
          { roomId },
          ({ participants }: { participants: UserData[] }) => {
            console.log({ participants }, "Initial Participants");
            setParticipants(participants);
          }
        );

        navigate(`/room/${state.roomId}`, {
          state: {
            type: "join",
            roomId: state.roomId,
            hostName,
            roomCreatedAt: state.roomCreatedAt,
          },
        });

        if (cameraOpened && produceTransport) {
          await produce({
            transport: produceTransport,
            trackConfig: {
              track: localVideoStream?.getVideoTracks()[0],
            },
            setProducer: setVideoProducer,
          });
        }
        if (micOpened && produceTransport) {
          await produce({
            transport: produceTransport,
            trackConfig: { track: localAudioStream?.getAudioTracks()[0] },
            setProducer: setAudioProducer,
          });
        }
      }
    );
  }

  /* Get Initial Producers */
  useEffect(() => {
    if (!device || !rtpCapabilities || !receiveTransport) return;

    const handleGetOtherProducers = ({
      producers,
    }: {
      producers: {
        kind: string;
        producerId: string;
        userData: UserData;
        paused: boolean;
      }[];
    }) => {
      console.log({ producers }, "initial producers");
      producers.forEach(({ kind, producerId, userData, paused }) => {
        handleConsume({
          roomId,
          producerId,
          kind,
          producerData: userData,
          callback: (track) => {
            const stream = new MediaStream([track]);
            if (kind === "video") {
              addRemoteStream({
                stream,
                paused,
                producerId,
                emitterId: userData.id,
              });
            } else {
              addRemoteAudioStream({
                stream,
                paused,
                producerId,
                emitterId: userData.id,
              });
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
    addRemoteStream,
    addRemoteAudioStream,
  ]);

  /* Listen for producer updates */
  useListenProducerUpdate({
    roomId,
  });

  return (
    <div className="lg:col-span-2">
      <Card className="bg-black/40 p-0 backdrop-blur-sm border-gray-800/50 shadow-2xl mb-8">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {!cameraOpened && (
              <div className="absolute inset-0 z-1 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-semibold text-white">
                      <User />
                    </span>
                  </div>
                  <p className="text-gray-400">Camera is off</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              <video
                ref={(el) => {
                  if (el && localVideoStream) el.srcObject = localVideoStream;
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Status badges */}
            <div className="absolute z-1 top-4 left-4 flex gap-2">
              <Badge
                variant="secondary"
                className="bg-black/80 text-white border-gray-800"
              >
                <Monitor className="w-3 h-3 mr-1" />
                Screen sharing ready
              </Badge>
            </div>

            {/* Audio indicator */}
            {micOpened && (
              <div className="absolute z-1 bottom-4 left-4">
                <div className="flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-full text-sm border border-gray-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Audio detected</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <Button
          variant={!micOpened ? "destructive" : "secondary"}
          size="lg"
          className="w-16 h-16 rounded-full text-gray-400 hover:text-white cursor-pointer bg-black/40 hover:bg-black/60 border-gray-800"
          onClick={micOpened ? handleMicClose : handleMicOpen}
        >
          {!micOpened ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>

        <Button
          variant={!cameraOpened ? "destructive" : "secondary"}
          size="lg"
          className="w-16 text-gray-400 hover:text-white h-16 cursor-pointer rounded-full bg-black/40 hover:bg-black/60 border-gray-800"
          onClick={cameraOpened ? handleCameraClose : handleCameraOpen}
        >
          {!cameraOpened ? (
            <VideoOff className="w-6 h-6" />
          ) : (
            <Video className="w-6 h-6" />
          )}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-16 h-16 cursor-pointer rounded-full transition-colors bg-black/40 hover:bg-gray-900 group border-gray-800"
          // onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-6 h-6 text-gray-400 group-hover:text-white" />
        </Button>
      </div>

      {/* Join Button */}
      <div className="text-center">
        <Button
          onClick={handleJoinRoom}
          size="lg"
          className="bg-white cursor-pointer hover:bg-gray-200 text-black font-medium px-10 py-6 text-base rounded-full transition-all duration-300"
        >
          <Phone className="w-5 h-5 mr-1" />
          Join now
        </Button>
        <p className="text-gray-500 text-sm mt-4">
          By joining, you agree to our terms of service
        </p>
      </div>
    </div>
  );
}
