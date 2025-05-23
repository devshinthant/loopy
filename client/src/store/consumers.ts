import type { Consumer } from "mediasoup-client/types";
import { create } from "zustand";

interface ConsumerState {
  consumers: Consumer[];
  setConsumers: (consumers: Consumer[]) => void;
  resetConsumers: () => void;
  addConsumer: (consumer: Consumer) => void;
}

const initialState: Omit<
  ConsumerState,
  "setConsumers" | "resetConsumers" | "addConsumer"
> = {
  consumers: [],
};

const useConsumersStore = create<ConsumerState>()((set) => ({
  ...initialState,
  setConsumers: (consumers) => set({ consumers }),
  resetConsumers: () => set(initialState),
  addConsumer: (consumer) =>
    set((state) => ({ consumers: [...state.consumers, consumer] })),
}));

export default useConsumersStore;
