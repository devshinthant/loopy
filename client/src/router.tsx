import { createBrowserRouter } from "react-router";
import Setup from "./pages/setup";
import Room from "./pages/room";
import Preview from "./pages/preview";
import SignInRoute from "./pages/auth/SignIn";
import SignUpRoute from "./pages/auth/SignUp";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout";

const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: <SignInRoute />,
  },
  {
    path: "/sign-up",
    element: <SignUpRoute />,
  },
  {
    path: "/",
    element: <AuthenticatedLayout />,
    children: [
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
