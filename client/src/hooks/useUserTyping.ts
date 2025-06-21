import { socket } from "@/lib/socket";
import { useEffect, useRef, useState } from "react";

const TYPING_TIMEOUT = 2000;

export default function useUserTyping(roomId: string) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingStatusRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, UserData>>({});

  const handleTyping = () => {
    // Emit "typing" to server
    socket.emit("typing", { roomId });
    // Emit "stop-typing" after timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing");
    }, TYPING_TIMEOUT);
  };

  useEffect(() => {
    const listenUserTyping = ({
      from,
      typing,
    }: {
      from: UserData;
      typing: boolean;
    }) => {
      setTypingUsers((prev) => {
        if (typing) {
          if (typingStatusRef.current[from.id]) {
            clearTimeout(typingStatusRef.current[from.id]);
          }

          typingStatusRef.current[from.id] = setTimeout(() => {
            setTypingUsers((p) => {
              const updated = { ...p };
              delete updated[from.id];
              return updated;
            });
          }, TYPING_TIMEOUT);

          return { ...prev, [from.id]: from };
        } else {
          if (typingStatusRef.current[from.id]) {
            clearTimeout(typingStatusRef.current[from.id]);
          }
          const updated = { ...prev };
          delete updated[from.id];
          return updated;
        }
      });
    };
    socket.on("user-typing", listenUserTyping);

    return () => {
      socket.off("user-typing", listenUserTyping);
    };
  }, []);

  return { typingUsers, handleTyping };
}
