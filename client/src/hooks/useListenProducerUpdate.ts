import handleConsume from "@/lib/handleConsume";
import { socket } from "@/lib/socket";
import useConsumersStore from "@/store/consumers";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";
import useRemoteStreamStore from "@/store/remote-streams";
import useRoomStore from "@/store/room";
import useTransportsStore from "@/store/transports";
import { useEffect } from "react";

interface UseListenProducerUpdateProps {
  roomId: string;
}

export default function useListenProducerUpdate({
  roomId,
}: UseListenProducerUpdateProps) {
  const { receiveTransport } = useTransportsStore();
  const { rtpCapabilities } = useRoomStore();
  const { addRemoteStream, removeRemoteStream } = useRemoteStreamStore();
  const { addRemoteAudioStream, removeRemoteAudioStream } =
    useRemoteAudioStreamStore();
  const { addConsumer } = useConsumersStore();

  useEffect(() => {
    const onNewProducer = ({
      producerId,
      kind,
      type,
    }: {
      producerId: string;
      kind: "audio" | "video" | "both";
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
            if (kind === "video") {
              addRemoteStream({ stream, paused: false, producerId });
            } else {
              console.log("remote audio producer", producerId);
              addRemoteAudioStream({ stream, paused: false, producerId });
            }
          },
        });
      } else {
        if (kind === "video") {
          removeRemoteStream(producerId);
        } else if (kind === "audio") {
          removeRemoteAudioStream(producerId);
        }
        //  else {
        //   /* Both */
        //   console.log("both", "removed", producerId);

        //   removeRemoteStream(producerId);
        //   removeRemoteAudioStream(producerId);
        // }
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
    addRemoteAudioStream,
    removeRemoteStream,
    removeRemoteAudioStream,
  ]);
}
