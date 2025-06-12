import { TooltipContent } from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { TooltipTrigger } from "@/components/ui/tooltip";

import { Tooltip } from "@/components/ui/tooltip";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ArrowUp } from "lucide-react";
import produce from "@/lib/produce";
import useTransportsStore from "@/store/transports";
import useLocalStreamStore from "@/store/local-streams";
import useProducersStore from "@/store/producers";
import { socket } from "@/lib/socket";
import { useParams } from "react-router";
import { toast } from "sonner";
import { useCallback, useEffect } from "react";

export default function Share() {
  const { produceTransport } = useTransportsStore();
  const { setLocalScreenStream, localScreenStream, resetLocalScreenStream } =
    useLocalStreamStore();
  const { setScreenProducer, screenProducer, resetScreenProducer } =
    useProducersStore();
  const params = useParams();
  const roomId = params.roomId as string;

  const handleShare = async () => {
    if (!produceTransport) return;
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert("Screen sharing not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      setLocalScreenStream(stream);

      produce({
        transport: produceTransport,
        trackConfig: {
          appData: {
            screenShare: true,
          },
          track: stream.getVideoTracks()[0],
        },
        setProducer: setScreenProducer,
      });
      return stream;
    } catch (err) {
      console.error("Failed to get screen stream", err);
    }
  };

  const handleStopShare = useCallback(() => {
    if (!screenProducer || !localScreenStream) return;

    // Stop all tracks in the stream
    localScreenStream.getTracks().forEach((track) => track.stop());

    // Notify server about screen share end
    socket.emit(
      "end-screen-share",
      {
        roomId,
      },
      ({ message }: { message: string }) => {
        toast.success(message);
      }
    );

    // Close the producer
    screenProducer.close();

    // Reset local state
    resetLocalScreenStream();
    resetScreenProducer();
  }, [
    localScreenStream,
    roomId,
    screenProducer,
    resetLocalScreenStream,
    resetScreenProducer,
  ]);

  useEffect(() => {
    if (localScreenStream) {
      localScreenStream
        .getVideoTracks()[0]
        .addEventListener("ended", handleStopShare);
    }

    return () => {
      if (localScreenStream) {
        localScreenStream
          .getVideoTracks()[0]
          .removeEventListener("ended", handleStopShare);
      }
    };
  }, [localScreenStream, handleStopShare]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={localScreenStream ? handleStopShare : handleShare}
            variant="secondary"
            className={`rounded-md cursor-pointer ${
              localScreenStream
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            <ArrowUp strokeWidth={2.2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {localScreenStream ? "Stop sharing" : "Share screen"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
