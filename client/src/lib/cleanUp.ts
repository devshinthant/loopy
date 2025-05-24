import type { RemoteStream } from "@/store/remote-streams";
import type { Consumer, Producer, Transport } from "mediasoup-client/types";

interface Props {
  produceTransport: Transport;
  resetProduceTransport: () => void;
  receiveTransport: Transport;
  resetReceiveTransport: () => void;
  localVideoStream: MediaStream;
  resetLocalVideoStream: () => void;
  remoteStreams: RemoteStream[];
  resetRemoteStreams: () => void;
  videoProducer: Producer;
  resetVideoProducer: () => void;
  consumers: Consumer[];
  resetConsumers: () => void;
}

const cleanUp = ({
  produceTransport,
  resetProduceTransport,
  receiveTransport,
  resetReceiveTransport,
  localVideoStream,
  resetLocalVideoStream,
  remoteStreams,
  resetRemoteStreams,
  videoProducer,
  resetVideoProducer,
  consumers,
  resetConsumers,
}: Props) => {
  console.log("Cleaning Up...");

  /* Close Transports */
  produceTransport?.close();
  resetProduceTransport();
  receiveTransport?.close();
  resetReceiveTransport();
  console.log("Transports closed");

  /* Close Local Stream */
  localVideoStream?.getTracks().forEach((track) => track.stop());
  resetLocalVideoStream();
  console.log("Local Stream Reset");

  /* Close Remote Streams */
  remoteStreams?.forEach(({ stream }) =>
    stream.getTracks().forEach((track) => track.stop())
  );
  resetRemoteStreams();
  console.log("Remote Streams Reset");

  /* Close Video Producer */
  videoProducer?.close();
  resetVideoProducer();
  console.log("Producer Closed");

  /* Close Consumers */
  consumers?.forEach((consumer) => consumer.close());
  resetConsumers();
  console.log("Consumers Closed");
};

export default cleanUp;
