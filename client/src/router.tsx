import { createBrowserRouter } from "react-router";
import Login from "./pages/auth/Login";
import Setup from "./pages/setup";
import Room from "./pages/room";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/setup",
    element: <Setup />,
  },
  {
    path: "/room/:roomId",
    element: <Room />,
  },
  {
    path: "/",
    element: <div>Hello World</div>,
  },
]);

export default router;
