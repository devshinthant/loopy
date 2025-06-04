import { socket } from "@/lib/socket";
import type { UserData } from "@/store/consumers";
import { useParticipantsStore } from "@/store/participants";
import { useEffect } from "react";

export default function useListenParticipants() {
  const { addParticipant, removeParticipant } = useParticipantsStore.getState();

  useEffect(() => {
    const handleParticipantUpdate = (participant: UserData) => {
      console.log({ participant });
      addParticipant(participant);
    };

    socket.on("participant-update", handleParticipantUpdate);

    return () => {
      socket.off("participant-update", handleParticipantUpdate);
    };
  }, [addParticipant, removeParticipant]);
}
