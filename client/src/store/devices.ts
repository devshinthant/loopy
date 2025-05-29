import { create } from "zustand";

interface DeviceState {
  selectedAudioInput: MediaDeviceInfo | null;
  setSelectedAudioInput: (device: MediaDeviceInfo) => void;
  resetSelectedAudioInput: () => void;

  selectedAudioOutput: MediaDeviceInfo | null;
  setSelectedAudioOutput: (device: MediaDeviceInfo) => void;
  resetSelectedAudioOutput: () => void;

  selectedVideoInput: MediaDeviceInfo | null;
  setSelectedVideoInput: (device: MediaDeviceInfo) => void;
  resetSelectedVideoInput: () => void;

  audioInputs: MediaDeviceInfo[];
  setAudioInputs: (devices: MediaDeviceInfo[]) => void;
  resetAudioInputs: () => void;

  audioOutputs: MediaDeviceInfo[];
  setAudioOutputs: (devices: MediaDeviceInfo[]) => void;
  resetAudioOutputs: () => void;

  videoInputs: MediaDeviceInfo[];
  setVideoInputs: (devices: MediaDeviceInfo[]) => void;
  resetVideoInputs: () => void;

  micOpened: boolean;
  setMicOpened: (opened: boolean) => void;
  resetMicOpened: () => void;

  cameraOpened: boolean;
  setCameraOpened: (opened: boolean) => void;
  resetCameraOpened: () => void;
}

const initialState: Omit<
  DeviceState,
  | "setSelectedAudioInput"
  | "resetSelectedAudioInput"
  | "setSelectedAudioOutput"
  | "resetSelectedAudioOutput"
  | "setSelectedVideoInput"
  | "resetSelectedVideoInput"
  | "setAudioInputs"
  | "resetAudioInputs"
  | "setAudioOutputs"
  | "resetAudioOutputs"
  | "setVideoInputs"
  | "resetVideoInputs"
  | "setMicOpened"
  | "resetMicOpened"
  | "setCameraOpened"
  | "resetCameraOpened"
> = {
  selectedAudioInput: null,
  selectedAudioOutput: null,
  selectedVideoInput: null,
  audioInputs: [],
  audioOutputs: [],
  videoInputs: [],
  micOpened: false,
  cameraOpened: false,
};

const useDeviceStore = create<DeviceState>()((set) => ({
  ...initialState,
  setSelectedAudioInput: (device) => set({ selectedAudioInput: device }),
  resetSelectedAudioInput: () => set({ selectedAudioInput: null }),
  setSelectedAudioOutput: (device) => set({ selectedAudioOutput: device }),
  resetSelectedAudioOutput: () => set({ selectedAudioOutput: null }),
  setSelectedVideoInput: (device) => set({ selectedVideoInput: device }),
  resetSelectedVideoInput: () => set({ selectedVideoInput: null }),
  setAudioInputs: (devices) => set({ audioInputs: devices }),
  resetAudioInputs: () => set({ audioInputs: [] }),
  setAudioOutputs: (devices) => set({ audioOutputs: devices }),
  resetAudioOutputs: () => set({ audioOutputs: [] }),
  setVideoInputs: (devices) => set({ videoInputs: devices }),
  resetVideoInputs: () => set({ videoInputs: [] }),
  setMicOpened: (opened) => set({ micOpened: opened }),
  resetMicOpened: () => set({ micOpened: false }),
  setCameraOpened: (opened) => set({ cameraOpened: opened }),
  resetCameraOpened: () => set({ cameraOpened: false }),
}));

export default useDeviceStore;
