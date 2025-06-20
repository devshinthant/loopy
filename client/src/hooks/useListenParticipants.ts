import { playNotification } from "@/lib/playNotification";
import { socket } from "@/lib/socket";
import { useParticipantsStore } from "@/store/participants";
import { useEffect } from "react";

export default function useListenParticipants() {
  const { addParticipant, removeParticipant } = useParticipantsStore.getState();

  useEffect(() => {
    const handleParticipantUpdate = ({
      type,
      participant,
    }: {
      type: "add" | "remove";
      participant: UserData;
    }) => {
      if (type === "add") {
        playNotification("join");
        addParticipant(participant);
      } else {
        playNotification("leave");
        removeParticipant(participant.id);
      }
    };

    socket.on("participant-update", handleParticipantUpdate);

    return () => {
      socket.off("participant-update", handleParticipantUpdate);
    };
  }, [addParticipant, removeParticipant]);
}
