import type {
  AppData,
  Producer,
  ProducerOptions,
  Transport,
} from "mediasoup-client/types";

interface ProduceProps {
  transport: Transport;
  trackConfig: ProducerOptions<AppData>;
  setProducer: (producer: Producer) => void;
}

const produce = async ({
  transport,
  trackConfig,
  setProducer,
}: ProduceProps) => {
  try {
    const localProducer = await transport.produce(trackConfig);
    console.log("Local producer created", localProducer);

    setProducer(localProducer);
    return localProducer;
  } catch (error) {
    console.log(error, "Producing");
  }
};

export default produce;
