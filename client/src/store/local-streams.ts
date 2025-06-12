import { create } from "zustand";

interface LocalStreamState {
  localVideoStream: MediaStream | null;
  setLocalVideoStream: (localVideoStream: MediaStream) => void;
  resetLocalVideoStream: () => void;

  localAudioStream: MediaStream | null;
  setLocalAudioStream: (localAudioStream: MediaStream) => void;
  resetLocalAudioStream: () => void;

  localScreenStream: MediaStream | null;
  setLocalScreenStream: (localScreenStream: MediaStream) => void;
  resetLocalScreenStream: () => void;
}

const initialState: Omit<
  LocalStreamState,
  | "setLocalVideoStream"
  | "resetLocalVideoStream"
  | "setLocalAudioStream"
  | "resetLocalAudioStream"
  | "setLocalScreenStream"
  | "resetLocalScreenStream"
> = {
  localVideoStream: null,
  localAudioStream: null,
  localScreenStream: null,
};

const useLocalStreamStore = create<LocalStreamState>()((set) => ({
  ...initialState,
  setLocalVideoStream: (localVideoStream) => set({ localVideoStream }),
  resetLocalVideoStream: () => set(initialState),
  setLocalAudioStream: (localAudioStream) => set({ localAudioStream }),
  resetLocalAudioStream: () => set(initialState),
  setLocalScreenStream: (localScreenStream) => set({ localScreenStream }),
  resetLocalScreenStream: () => set(initialState),
}));

export default useLocalStreamStore;
