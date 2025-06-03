import { UserButton, useUser } from "@clerk/clerk-react";
import { Toaster } from "../ui/sonner";
import Loading from "../loading";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <div className="h-dvh relative w-dvw">
      <div className="absolute right-10 top-10 ">
        {user ? <UserButton /> : null}
      </div>
      {children}
      <Toaster />
    </div>
  );
}
