import { create } from "zustand";

interface LocalStreamState {
  localVideoStream: MediaStream | null;
  setLocalVideoStream: (localVideoStream: MediaStream) => void;
  resetLocalVideoStream: () => void;

  localAudioStream: MediaStream | null;
  setLocalAudioStream: (localAudioStream: MediaStream) => void;
  resetLocalAudioStream: () => void;
}

const initialState: Omit<
  LocalStreamState,
  | "setLocalVideoStream"
  | "resetLocalVideoStream"
  | "setLocalAudioStream"
  | "resetLocalAudioStream"
> = {
  localVideoStream: null,
  localAudioStream: null,
};

const useLocalStreamStore = create<LocalStreamState>()((set) => ({
  ...initialState,
  setLocalVideoStream: (localVideoStream) => set({ localVideoStream }),
  resetLocalVideoStream: () => set(initialState),
  setLocalAudioStream: (localAudioStream) => set({ localAudioStream }),
  resetLocalAudioStream: () => set(initialState),
}));

export default useLocalStreamStore;
