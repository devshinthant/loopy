import { SignedIn, useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet, useNavigate } from "react-router";
import Loading from "../loading";
import RootLayout from "./RootLayout";
import { socket } from "@/lib/socket";
import { useEffect, useRef, useState } from "react";
import useListenDeviceChange from "@/hooks/useListenDeviceChange";
import cleanUp from "@/lib/cleanUp";
import useSocketStore from "@/store/socket";

export default function AuthenticatedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { setIsConnected } = useSocketStore();
  const [isSocketInitialized, setIsSocketInitialized] = useState(false);

  const hasRun = useRef(false);

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

  // Initialize socket connection first
  useEffect(() => {
    console.log("Initializing socket connection");

    const onConnectionSuccess = (data: unknown) => {
      console.log(data, "DATA");
      setIsConnected(true);
      setIsSocketInitialized(true);
    };

    const onDisconnect = () => {
      cleanUp();
      setIsConnected(false);
      setIsSocketInitialized(true);
    };

    const onConnectError = (error: Error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
      setIsSocketInitialized(true);
    };

    // Add connection timeout for Render
    const connectionTimeout = setTimeout(() => {
      if (!socket.connected) {
        console.warn("Socket connection timeout");
        setIsConnected(false);
        setIsSocketInitialized(true);
      }
    }, 5000); // 5 second timeout

    socket.connect();
    socket.on("connection-success", onConnectionSuccess);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      console.log("CLEAN");
      clearTimeout(connectionTimeout);
      socket.off("connection-success", onConnectionSuccess);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [setIsConnected]);

  if (!isLoaded) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  // Wait for socket initialization before rendering children
  if (!isSocketInitialized) {
    return <Loading />;
  }

  return (
    <SignedIn>
      <RootLayout>
        <Outlet />
      </RootLayout>
    </SignedIn>
  );
}
