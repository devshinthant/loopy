import type { UserData } from "@/store/consumers";
import useConsumersStore from "@/store/consumers";
import useTransportsStore from "@/store/transports";
import type { AppData, ConsumerOptions } from "mediasoup-client/types";

interface ConsumeProps {
  consumer: ConsumerOptions<AppData>;
  producerData: UserData;
}

const consume = async ({ consumer, producerData }: ConsumeProps) => {
  try {
    const { addConsumer } = useConsumersStore.getState();
    const { receiveTransport } = useTransportsStore.getState();

    if (!receiveTransport) {
      return console.log("Waiting for transport...");
    }

    const localConsumer = await receiveTransport.consume(consumer);

    addConsumer({
      consumer: localConsumer,
      userData: producerData,
    });
    return localConsumer;
  } catch (error) {
    console.error("Error consuming:", error);
  }
};

export default consume;
