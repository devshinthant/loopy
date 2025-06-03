import type { AppData, ConsumerOptions } from "mediasoup-client/types";
import { socket } from "./socket";
import consume from "./consume";
import type { UserData } from "@/store/consumers";
import useRoomStore from "@/store/room";

interface HandleConsumeProps {
  producerData: UserData;
  roomId: string;
  producerId: string;
  kind: string;
  callback: (track: MediaStreamTrack) => void;
}

const handleConsume = ({
  roomId,
  producerId,
  kind,
  callback,
  producerData,
}: HandleConsumeProps) => {
  const { rtpCapabilities } = useRoomStore.getState();

  if (!rtpCapabilities) {
    return console.log("Waiting for transport or capabilities...");
  }

  try {
    socket.emit(
      "consumeProducer",
      {
        rtpCapabilities,
        roomId,
        producerId,
        kind,
      },
      async (consumer: ConsumerOptions<AppData> & { error?: string }) => {
        if (consumer.error) {
          return console.error("Consumer error:", consumer.error);
        }

        const localConsumer = await consume({
          consumer,
          producerData,
        });

        try {
          if (localConsumer) {
            const { track } = localConsumer;

            callback(track);

            console.log("Successfully consumed track:", { track });

            socket.emit("resumePausedConsumer", {
              producerId,
              roomId,
            });
          }
        } catch (error) {
          console.error("Error consuming:", error);
        }
      }
    );
  } catch (error) {
    console.error("Error in handleNewProducer:", error);
  }
};

export default handleConsume;
