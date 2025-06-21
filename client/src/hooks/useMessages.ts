import { playNotification } from "@/lib/playNotification";
import { socket } from "@/lib/socket";
import { useEffect, useState } from "react";

export interface Message {
  id: string;
  userData: UserData;
  message: string;
  createdAt: Date;
  isOwn: boolean;
  type: "text" | "image" | "file";
}

export default function useMessages({
  roomId,
  disableNotifications,
}: {
  roomId: string;
  disableNotifications: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [notiCount, setNotiCount] = useState(0);

  const sendMessage = (message: string) => {
    socket.emit("send-message", { roomId, message }, (message: Message) => {
      const modMessage = { ...message, isOwn: true };
      setMessages((prev) => [...prev, modMessage]);
      socket.emit("stop-typing");
    });
  };

  useEffect(() => {
    const handleReceiveMessage = (message: Message) => {
      console.log(message, "RECEIVED");
      if (!disableNotifications) {
        playNotification("message");
        setNotiCount((prev) => prev + 1);
      }
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [disableNotifications]);

  return { messages, sendMessage, notiCount, setNotiCount };
}
