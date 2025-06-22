import { create } from "zustand";

interface RaiseHandState {
  raisedHands: string[]; // Array of participant IDs who have raised their hands
}

interface RaiseHandHandlers {
  addRaisedHand: (participantId: string) => void;
  removeRaisedHand: (participantId: string) => void;
  clearRaisedHands: () => void;
  isHandRaised: (participantId: string) => boolean;
}

interface RaiseHandStore extends RaiseHandState, RaiseHandHandlers {}

const useRaiseHandStore = create<RaiseHandStore>((set, get) => ({
  raisedHands: [],

  addRaisedHand: (participantId: string) => {
    set((state) => ({
      raisedHands: [...new Set([...state.raisedHands, participantId])],
    }));
  },

  removeRaisedHand: (participantId: string) => {
    set((state) => ({
      raisedHands: state.raisedHands.filter((id) => id !== participantId),
    }));
  },

  clearRaisedHands: () => {
    set({ raisedHands: [] });
  },

  isHandRaised: (participantId: string) => {
    return get().raisedHands.includes(participantId);
  },
}));

export default useRaiseHandStore;
