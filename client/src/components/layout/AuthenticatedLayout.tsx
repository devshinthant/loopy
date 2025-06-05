import { SignedIn, useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";
import Loading from "../loading";
import RootLayout from "./RootLayout";
import { socket } from "@/lib/socket";
import { useEffect } from "react";

export default function AuthenticatedLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    socket.on("connection-success", (data) => {
      console.log(data);
    });
  }, [isLoaded]);

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
