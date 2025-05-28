import { Outlet } from "react-router";
import { Toaster } from "../ui/sonner";

export default function RootLayout() {
  return (
    <div>
      <Outlet />
      <Toaster />
    </div>
  );
}
