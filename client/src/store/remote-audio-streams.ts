import { create } from "zustand";

export type RemoteAudioStream = {
  paused: boolean;
  producerId: string;
  stream: MediaStream;
  emitterId: string;
};

interface RemoteAudioStreamState {
  remoteAudioStreams: RemoteAudioStream[] | null;
  setRemoteAudioStreams: (remoteAudioStreams: RemoteAudioStream[]) => void;
  addRemoteAudioStream: (remoteAudioStream: RemoteAudioStream) => void;

  pauseRemoteAudioStream: (producerId: string) => void;
  resumeRemoteAudioStream: (producerId: string) => void;
  resetRemoteAudioStreams: () => void;
  removeRemoteAudioStream: (producerId: string) => void;
}

const initialState: Omit<
  RemoteAudioStreamState,
  | "setRemoteAudioStreams"
  | "resetRemoteAudioStreams"
  | "addRemoteAudioStream"
  | "pauseRemoteAudioStream"
  | "resumeRemoteAudioStream"
  | "removeRemoteAudioStream"
> = {
  remoteAudioStreams: null,
};

const useRemoteAudioStreamStore = create<RemoteAudioStreamState>()((set) => ({
  ...initialState,
  setRemoteAudioStreams: (remoteAudioStreams) => set({ remoteAudioStreams }),
  resetRemoteAudioStreams: () => set(initialState),
  addRemoteAudioStream: (remoteAudioStream) =>
    set((state) => ({
      remoteAudioStreams: [
        ...(state.remoteAudioStreams || []),
        remoteAudioStream,
      ],
    })),
  pauseRemoteAudioStream: (producerId) =>
    set((state) => ({
      remoteAudioStreams: state.remoteAudioStreams?.map((stream) =>
        stream.producerId === producerId ? { ...stream, paused: true } : stream
      ),
    })),
  resumeRemoteAudioStream: (producerId) =>
    set((state) => ({
      remoteAudioStreams: state.remoteAudioStreams?.map((stream) =>
        stream.producerId === producerId ? { ...stream, paused: false } : stream
      ),
    })),
  removeRemoteAudioStream: (producerId) =>
    set((state) => ({
      remoteAudioStreams: state.remoteAudioStreams?.filter(
        (stream) => stream.producerId !== producerId
      ),
    })),
}));

export default useRemoteAudioStreamStore;
