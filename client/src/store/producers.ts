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

  /* Screen Producer */
  screenProducer: Producer | null;
  setScreenProducer: (screenProducer: Producer) => void;
  resetScreenProducer: () => void;
}

const initialState: Omit<
  ProducerState,
  | "setVideoProducer"
  | "resetVideoProducer"
  | "setAudioProducer"
  | "resetAudioProducer"
  | "setScreenProducer"
  | "resetScreenProducer"
> = {
  videoProducer: null,
  audioProducer: null,
  screenProducer: null,
};

const useProducersStore = create<ProducerState>()((set) => ({
  ...initialState,
  setVideoProducer: (videoProducer) => set({ videoProducer }),
  resetVideoProducer: () => set((state) => ({ ...state, videoProducer: null })),
  setAudioProducer: (audioProducer) => set({ audioProducer }),
  resetAudioProducer: () => set((state) => ({ ...state, audioProducer: null })),
  setScreenProducer: (screenProducer) => set({ screenProducer }),
  resetScreenProducer: () =>
    set((state) => ({ ...state, screenProducer: null })),
}));

export default useProducersStore;
