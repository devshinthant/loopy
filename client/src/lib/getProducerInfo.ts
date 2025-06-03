import useConsumersStore from "@/store/consumers";

interface Props {
  producerId: string;
}

export const getProducerInfo = ({ producerId }: Props) => {
  const { consumers } = useConsumersStore.getState();
  console.log({ consumers });

  const consumer = consumers.find((c) => c.consumer.producerId === producerId);
  return consumer?.userData;
};
