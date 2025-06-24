import { create } from "zustand";

interface SocketState {
  isConnected: boolean;
}

interface SocketAction {
  setIsConnected: (isConnected: boolean) => void;
}

type Socket = SocketState & SocketAction;

const initialState: SocketState = {
  isConnected: false,
};

const useSocketStore = create<Socket>()((set) => ({
  ...initialState,
  setIsConnected: (isConnected) => set({ isConnected }),
}));

export default useSocketStore;
