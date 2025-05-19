import { createBrowserRouter } from "react-router";
import Login from "./pages/auth/Login";
import Room from "./pages/room";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/room",
    element: <Room />,
  },
  {
    path: "/",
    element: <div>Hello World</div>,
  },
]);

export default router;
