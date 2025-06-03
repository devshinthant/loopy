import useConsumersStore from "@/store/consumers";

interface Props {
  producerId: string;
}

export const getProducerInfo = ({ producerId }: Props) => {
  const { consumers } = useConsumersStore.getState();

  const consumer = consumers.find((c) => c.consumer.producerId === producerId);
  console.log({ consumer });

  return consumer?.userData;
};
