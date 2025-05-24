import { create } from "zustand";

export type RemoteStream = {
  paused: boolean;
  producerId: string;
  stream: MediaStream;
};

interface RemoteStreamState {
  remoteStreams: RemoteStream[] | null;
  setRemoteStreams: (remoteStreams: RemoteStream[]) => void;
  addRemoteStream: (remoteStream: RemoteStream) => void;

  pauseRemoteStream: (producerId: string) => void;
  resumeRemoteStream: (producerId: string) => void;
  resetRemoteStreams: () => void;
  removeRemoteStream: (producerId: string) => void;
}

const initialState: Omit<
  RemoteStreamState,
  | "setRemoteStreams"
  | "resetRemoteStreams"
  | "addRemoteStream"
  | "pauseRemoteStream"
  | "resumeRemoteStream"
  | "removeRemoteStream"
> = {
  remoteStreams: null,
};

const useRemoteStreamStore = create<RemoteStreamState>()((set) => ({
  ...initialState,
  setRemoteStreams: (remoteStreams) => set({ remoteStreams }),
  resetRemoteStreams: () => set(initialState),
  addRemoteStream: (remoteStream) =>
    set((state) => ({
      remoteStreams: [...(state.remoteStreams || []), remoteStream],
    })),
  pauseRemoteStream: (producerId) =>
    set((state) => ({
      remoteStreams: state.remoteStreams?.map((stream) =>
        stream.producerId === producerId ? { ...stream, paused: true } : stream
      ),
    })),
  resumeRemoteStream: (producerId) =>
    set((state) => ({
      remoteStreams: state.remoteStreams?.map((stream) =>
        stream.producerId === producerId ? { ...stream, paused: false } : stream
      ),
    })),
  removeRemoteStream: (producerId) =>
    set((state) => ({
      remoteStreams: state.remoteStreams?.filter(
        (stream) => stream.producerId !== producerId
      ),
    })),
}));

export default useRemoteStreamStore;
