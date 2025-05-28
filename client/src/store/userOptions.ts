import { create } from "zustand";

interface UserOptionsState {
  micOpened: boolean;
  cameraOpened: boolean;
}

interface UserOptionsActions {
  setMicOpened: (micOpened: boolean) => void;
  setCameraOpened: (cameraOpened: boolean) => void;
}

type UserOptionsStore = UserOptionsState & UserOptionsActions;

const initialState: UserOptionsState = {
  micOpened: false,
  cameraOpened: false,
};

const useUserOptionsStore = create<UserOptionsStore>()((set) => ({
  ...initialState,
  setMicOpened: (micOpened) => set({ micOpened }),
  setCameraOpened: (cameraOpened) => set({ cameraOpened }),
}));

export default useUserOptionsStore;
