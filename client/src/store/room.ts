import type { Device, RtpCapabilities } from "mediasoup-client/types";
import { create } from "zustand";

interface RoomState {
  /* Capabilities */
  rtpCapabilities: RtpCapabilities | null;
  setRtpCapabilities: (rtpCapabilities: RtpCapabilities) => void;
  resetRtpCapabilities: () => void;

  /* Device */
  device: Device | null;
  setDevice: (device: Device) => void;
  resetDevice: () => void;
}

const initialState: Omit<
  RoomState,
  | "setRtpCapabilities"
  | "resetRtpCapabilities"
  | "setDevice"
  | "resetDevice"
  | "setRoomCreatedAt"
  | "resetRoomCreatedAt"
> = {
  rtpCapabilities: null,
  device: null,
};

const useRoomStore = create<RoomState>()((set) => ({
  ...initialState,
  setRtpCapabilities: (rtpCapabilities) => set({ rtpCapabilities }),
  resetRtpCapabilities: () => set(initialState),
  setDevice: (device) => set({ device }),
  resetDevice: () => set(initialState),
}));

export default useRoomStore;
