import { createRoot } from "react-dom/client";
import "./index.css";

import { RouterProvider } from "react-router";
import router from "./router";
import { StrictMode } from "react";

import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/sign-in"
      signInFallbackRedirectUrl="/setup"
      signUpFallbackRedirectUrl="/setup"
    >
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
);
