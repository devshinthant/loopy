import type { Consumer } from "mediasoup-client/types";
import { create } from "zustand";

export type UserData = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isHost: boolean;
};

export type AppConsumer = {
  userData: UserData;
  consumer: Consumer;
};

interface ConsumerState {
  consumers: AppConsumer[];
  setConsumers: (consumers: AppConsumer[]) => void;
  resetConsumers: () => void;
  addConsumer: (consumer: AppConsumer) => void;
}

const initialState: Omit<
  ConsumerState,
  "setConsumers" | "resetConsumers" | "addConsumer" | "getConsumer"
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
