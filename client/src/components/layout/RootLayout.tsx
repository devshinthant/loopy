import { useEffect } from "react";
import { Toaster } from "../ui/sonner";
import { cleanupNotifications } from "@/lib/playNotification";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    return () => {
      cleanupNotifications();
    };
  }, []);

  return (
    <div className="h-dvh relative overflow-hidden w-dvw">
      {children}
      <Toaster />
    </div>
  );
}
