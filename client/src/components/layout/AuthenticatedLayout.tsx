import { SignedIn, useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet, useNavigate } from "react-router";
import Loading from "../loading";
import RootLayout from "./RootLayout";
import { socket } from "@/lib/socket";
import { useEffect, useRef } from "react";
import useListenDeviceChange from "@/hooks/useListenDeviceChange";
import cleanUp from "@/lib/cleanUp";

export default function AuthenticatedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    const onConnectionSuccess = (data: unknown) => {
      console.log(data);
    };

    const onDisconnect = () => {
      cleanUp();
    };

    socket.on("connection-success", onConnectionSuccess);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connection-success", onConnectionSuccess);
      socket.off("disconnect", onDisconnect);
    };
  }, [isLoaded, navigate]);

  // Effect to handle reload
  useEffect(() => {
    if (hasRun.current) return; // prevent double run in dev
    hasRun.current = true;
    const navEntry = performance.getEntriesByType("navigation")[0];
    const isReload =
      (navEntry as PerformanceNavigationTiming)?.type === "reload";

    if (isReload) {
      cleanUp();
      navigate("/");
    }
  }, [navigate]);

  useListenDeviceChange();

  if (!isLoaded) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  if (!socket.connected) {
    return <Navigate to="/socket-error" />;
  }

  return (
    <SignedIn>
      <RootLayout>
        <Outlet />
      </RootLayout>
    </SignedIn>
  );
}
