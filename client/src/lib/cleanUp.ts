import type { RemoteStream } from "@/store/remote-streams";
import type { Consumer, Producer, Transport } from "mediasoup-client/types";

interface Props {
  produceTransport: Transport;
  resetProduceTransport: () => void;

  receiveTransport: Transport;
  resetReceiveTransport: () => void;

  localVideoStream: MediaStream;
  resetLocalVideoStream: () => void;

  localAudioStream: MediaStream;
  resetLocalAudioStream: () => void;

  remoteStreams: RemoteStream[];
  resetRemoteStreams: () => void;

  remoteAudioStreams: RemoteStream[];
  resetRemoteAudioStreams: () => void;

  videoProducer: Producer;
  resetVideoProducer: () => void;

  audioProducer: Producer;
  resetAudioProducer: () => void;

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
  localAudioStream,
  resetLocalAudioStream,
  audioProducer,
  resetAudioProducer,
  remoteAudioStreams,
  resetRemoteAudioStreams,
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

  localAudioStream?.getTracks().forEach((track) => track.stop());
  resetLocalAudioStream();

  console.log("Local Stream Reset");

  /* Close Remote Streams */
  remoteStreams?.forEach(({ stream }) =>
    stream.getTracks().forEach((track) => track.stop())
  );
  resetRemoteStreams();

  remoteAudioStreams?.forEach(({ stream }) =>
    stream.getTracks().forEach((track) => track.stop())
  );
  resetRemoteAudioStreams();
  console.log("Remote Streams Reset");

  /* Close Video Producer */
  videoProducer?.close();
  resetVideoProducer();
  console.log("Producer Closed");

  /* Close Audio Producer */
  audioProducer?.close();
  resetAudioProducer();
  console.log("Audio Producer Closed");

  /* Close Consumers */
  consumers?.forEach((consumer) => consumer.close());
  resetConsumers();
  console.log("Consumers Closed");
};

export default cleanUp;
