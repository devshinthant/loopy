import { create } from "zustand";

type ParticipantState = {
  participants: UserData[];
};

type ParticipantAction = {
  setParticipants: (participants: UserData[]) => void;
  resetParticipants: () => void;
  addParticipant: (participant: UserData) => void;
  removeParticipant: (id: string) => void;
};

const initialState: ParticipantState = {
  participants: [],
};

const useParticipantsStore = create<ParticipantState & ParticipantAction>(
  (set) => ({
    ...initialState,
    setParticipants: (participants) => set({ participants }),
    resetParticipants: () => set(initialState),
    addParticipant: (participant) =>
      set((state) => ({ participants: [...state.participants, participant] })),
    removeParticipant: (id) =>
      set((state) => ({
        participants: state.participants.filter((p) => p.id !== id),
      })),
  })
);

export { useParticipantsStore };
