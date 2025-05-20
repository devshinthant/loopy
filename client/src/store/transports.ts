import type { Transport } from "mediasoup-client/types";
import { create } from "zustand";

interface TransportState {
  produceTransport: Transport | null;
  setProduceTransport: (produceTransport: Transport) => void;
  resetProduceTransport: () => void;

  receiveTransport: Transport | null;
  setReceiveTransport: (receiveTransport: Transport) => void;
  resetReceiveTransport: () => void;
}

const initialState: Omit<
  TransportState,
  | "setProduceTransport"
  | "resetProduceTransport"
  | "setReceiveTransport"
  | "resetReceiveTransport"
> = {
  produceTransport: null,
  receiveTransport: null,
};

const useTransportsStore = create<TransportState>()((set) => ({
  ...initialState,
  setProduceTransport: (produceTransport) => set({ produceTransport }),
  resetProduceTransport: () => set(initialState),
  setReceiveTransport: (receiveTransport) => set({ receiveTransport }),
  resetReceiveTransport: () => set(initialState),
}));

export default useTransportsStore;
