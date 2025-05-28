import { createBrowserRouter } from "react-router";
import Login from "./pages/auth/Login";
import Setup from "./pages/setup";
import Room from "./pages/room";
import RootLayout from "./components/layout/RootLayout";
import Preview from "./pages/preview";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/setup",
        element: <Setup />,
      },
      {
        path: "/preview",
        element: <Preview />,
      },
      {
        path: "/room/:roomId",
        element: <Room />,
      },
    ],
  },
]);

export default router;
