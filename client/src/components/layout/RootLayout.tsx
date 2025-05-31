import { Outlet } from "react-router";
import { Toaster } from "../ui/sonner";

export default function RootLayout() {
  return (
    <div className="h-dvh w-dvw">
      <Outlet />
      <Toaster />
    </div>
  );
}
