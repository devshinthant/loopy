import type {
  AppData,
  ConsumerOptions,
  RtpCapabilities,
  Transport,
} from "mediasoup-client/types";
import { socket } from "./socket";

interface HandleProducerProps {
  roomId: string;
  producerId: string;
  kind: string;
  receiveTransport: Transport | null;
  rtpCapabilities: RtpCapabilities | null;
  callback: (track: MediaStreamTrack) => void;
}

const handleProducer = ({
  roomId,
  producerId,
  kind,
  receiveTransport,
  rtpCapabilities,
  callback,
}: HandleProducerProps) => {
  if (!receiveTransport || !rtpCapabilities) {
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

        try {
          const localConsumer = await receiveTransport.consume(consumer);
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

export default handleProducer;
