import { create } from "zustand";

interface SelectedDevicesState {
  selectedAudioInput: string;
  selectedAudioOutput: string;
  selectedVideoInput: string;
}

interface SelectedDevicesActions {
  setSelectedAudioInput: (input: string) => void;
  setSelectedAudioOutput: (input: string) => void;
  setSelectedVideoInput: (input: string) => void;

  resetSelectedAudioInput: () => void;
  resetSelectedAudioOutput: () => void;
  resetSelectedVideoInput: () => void;
}

type SelectedDevicesStore = SelectedDevicesState & SelectedDevicesActions;

const initialState: SelectedDevicesState = {
  selectedAudioInput: "",
  selectedAudioOutput: "",
  selectedVideoInput: "",
};

const useSelectedDevicesStore = create<SelectedDevicesStore>()((set) => ({
  ...initialState,
  setSelectedAudioInput: (selectedAudioInput) => set({ selectedAudioInput }),
  setSelectedAudioOutput: (selectedAudioOutput) => set({ selectedAudioOutput }),
  setSelectedVideoInput: (selectedVideoInput) => set({ selectedVideoInput }),
  resetSelectedAudioInput: () => set(initialState),
  resetSelectedAudioOutput: () => set(initialState),
  resetSelectedVideoInput: () => set(initialState),
}));

export default useSelectedDevicesStore;
