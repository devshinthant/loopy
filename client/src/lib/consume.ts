import type {
  AppData,
  Consumer,
  ConsumerOptions,
  Transport,
} from "mediasoup-client/types";

interface ConsumeProps {
  receiveTransport: Transport;
  consumer: ConsumerOptions<AppData>;
  addConsumer: (consumers: Consumer) => void;
}

const consume = async ({
  receiveTransport,
  consumer,
  addConsumer,
}: ConsumeProps) => {
  try {
    const localConsumer = await receiveTransport.consume(consumer);
    addConsumer(localConsumer);
    return localConsumer;
  } catch (error) {
    console.error("Error consuming:", error);
  }
};

export default consume;
