import { SignedIn, useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";
import Loading from "../loading";
import RootLayout from "./RootLayout";

export default function AuthenticatedLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <SignedIn>
      <RootLayout>
        <Outlet />
      </RootLayout>
    </SignedIn>
  );
}
