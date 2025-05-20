import type { Producer } from "mediasoup-client/types";
import { create } from "zustand";

interface ProducerState {
  /* Video Producer */
  videoProducer: Producer | null;
  setVideoProducer: (videoProducer: Producer) => void;
  resetVideoProducer: () => void;

  /* Audio Producer */
  audioProducer: Producer | null;
  setAudioProducer: (audioProducer: Producer) => void;
  resetAudioProducer: () => void;
}

const initialState: Omit<
  ProducerState,
  | "setVideoProducer"
  | "resetVideoProducer"
  | "setAudioProducer"
  | "resetAudioProducer"
> = {
  videoProducer: null,
  audioProducer: null,
};

const useProducersStore = create<ProducerState>()((set) => ({
  ...initialState,
  setVideoProducer: (videoProducer) => set({ videoProducer }),
  resetVideoProducer: () => set(initialState),
  setAudioProducer: (audioProducer) => set({ audioProducer }),
  resetAudioProducer: () => set(initialState),
}));

export default useProducersStore;
