import { create } from "zustand";

export type RemoteScreenStream = {
  emitterId: string;
  stream: MediaStream;
};

interface RemoteScreenStreamState {
  remoteScreenStream: RemoteScreenStream | null;
  setRemoteScreenStream: (remoteScreenStreams: RemoteScreenStream) => void;
  addRemoteScreenStream: (remoteScreenStream: RemoteScreenStream) => void;
  resetRemoteScreenStream: () => void;
}

const initialState: Omit<
  RemoteScreenStreamState,
  | "setRemoteScreenStream"
  | "resetRemoteScreenStream"
  | "addRemoteScreenStream"
  | "removeRemoteScreenStream"
> = {
  remoteScreenStream: null,
};

const useRemoteScreenStreamStore = create<RemoteScreenStreamState>()((set) => ({
  ...initialState,
  setRemoteScreenStream: (remoteScreenStream) => set({ remoteScreenStream }),
  resetRemoteScreenStream: () => set(initialState),
  addRemoteScreenStream: (remoteScreenStream) =>
    set(() => ({
      remoteScreenStream: remoteScreenStream,
    })),
  removeRemoteScreenStream: () =>
    set(() => ({
      remoteScreenStream: null,
    })),
}));

export default useRemoteScreenStreamStore;
