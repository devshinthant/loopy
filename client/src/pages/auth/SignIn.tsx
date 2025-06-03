import Loading from "@/components/loading";
import { SignedOut, SignIn } from "@clerk/clerk-react";

export default function SignInRoute() {
  return (
    <SignedOut>
      <div className="w-full min-h-dvh flex items-center justify-center">
        <SignIn fallback={<Loading />} />
      </div>
    </SignedOut>
  );
}
