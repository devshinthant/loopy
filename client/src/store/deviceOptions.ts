import { create } from "zustand";

interface DeviceOptionsState {
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
}

interface DeviceOptionsActions {
  setAudioInputs: (inputs: MediaDeviceInfo[]) => void;
  setAudioOutputs: (outputs: MediaDeviceInfo[]) => void;
  setVideoInputs: (inputs: MediaDeviceInfo[]) => void;
}

type DeviceOptionsStore = DeviceOptionsState & DeviceOptionsActions;

const initialState: DeviceOptionsState = {
  audioInputs: [],
  audioOutputs: [],
  videoInputs: [],
};

const useDeviceOptionsStore = create<DeviceOptionsStore>()((set) => ({
  ...initialState,
  setAudioInputs: (audioInputs) => set({ audioInputs }),
  setAudioOutputs: (audioOutputs) => set({ audioOutputs }),
  setVideoInputs: (videoInputs) => set({ videoInputs }),
}));

export default useDeviceOptionsStore;
