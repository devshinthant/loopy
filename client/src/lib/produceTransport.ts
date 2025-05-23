import type {
  AppData,
  Producer,
  ProducerOptions,
  Transport,
} from "mediasoup-client/types";

interface ProduceTransportProps {
  transport: Transport;
  videoConfig: ProducerOptions<AppData>;
  setVideoProducer: (producer: Producer) => void;
}

const produceTransport = async ({
  transport,
  videoConfig,
  setVideoProducer,
}: ProduceTransportProps) => {
  const localProducer = await transport.produce(videoConfig);
  console.log("Local producer created", localProducer);
  setVideoProducer(localProducer);
};

export default produceTransport;
