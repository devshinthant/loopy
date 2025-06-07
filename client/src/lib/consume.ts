import useConsumersStore from "@/store/consumers";
import useTransportsStore from "@/store/transports";
import type { AppData, ConsumerOptions } from "mediasoup-client/types";

interface ConsumeProps {
  consumer: ConsumerOptions<AppData>;
}

const consume = async ({ consumer }: ConsumeProps) => {
  try {
    const { addConsumer } = useConsumersStore.getState();
    const { receiveTransport } = useTransportsStore.getState();

    if (!receiveTransport) {
      return console.log("Waiting for transport...");
    }

    const localConsumer = await receiveTransport.consume(consumer);

    addConsumer(localConsumer);
    return localConsumer;
  } catch (error) {
    console.error("Error consuming:", error);
  }
};

export default consume;
