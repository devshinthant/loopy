import { useFloatingEmojisContext } from "@/contexts/FloatingEmojisContext";
import { socket } from "@/lib/socket";
import { useEffect } from "react";

export default function useObserveReactions() {
  const { triggerEmoji } = useFloatingEmojisContext();

  useEffect(() => {
    const receviceEmojiReactionHandler = (data: {
      id: string;
      emoji: string;
    }) => {
      triggerEmoji(data.emoji);
    };

    socket.on("receive-emoji-reaction", receviceEmojiReactionHandler);

    return () => {
      socket.off("receive-emoji-reaction", receviceEmojiReactionHandler);
    };
  }, [triggerEmoji]);
}
