import { create } from "zustand";

type RemoteStream = {
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
}

const initialState: Omit<
  RemoteStreamState,
  | "setRemoteStreams"
  | "resetRemoteStreams"
  | "addRemoteStream"
  | "pauseRemoteStream"
  | "resumeRemoteStream"
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
}));

export default useRemoteStreamStore;
