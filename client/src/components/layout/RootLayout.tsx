import { useEffect } from "react";
import { Toaster } from "../ui/sonner";
import { cleanupNotifications } from "@/lib/playNotification";
import { Navigate } from "react-router";
import useSocketStore from "@/store/socket";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useSocketStore();

  useEffect(() => {
    return () => {
      cleanupNotifications();
    };
  }, []);

  console.log({ isConnected });

  if (!isConnected) {
    return <Navigate to="/socket-error" />;
  }

  return (
    <div className="h-dvh relative overflow-hidden w-dvw">
      {children}
      <Toaster />
    </div>
  );
}
