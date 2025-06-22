import { useEffect } from "react";
import { socket } from "@/lib/socket";
import useRaiseHandStore from "@/store/raiseHand";

export default function useObserveHands() {
  const { addRaisedHand, removeRaisedHand } = useRaiseHandStore();

  useEffect(() => {
    const listenRaiseHand = (data: { participantId: string }) => {
      addRaisedHand(data.participantId);
    };

    const listenLowerHand = (data: { participantId: string }) => {
      removeRaisedHand(data.participantId);
    };

    socket.on("participant-raised-hand", listenRaiseHand);
    socket.on("participant-lowered-hand", listenLowerHand);

    return () => {
      socket.off("participant-raised-hand", listenRaiseHand);
      socket.off("participant-lowered-hand", listenLowerHand);
    };
  }, [addRaisedHand, removeRaisedHand]);
}
