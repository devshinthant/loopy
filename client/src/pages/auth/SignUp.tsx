import Loading from "@/components/loading";
import { SignedOut, SignUp } from "@clerk/clerk-react";

export default function SignUpRoute() {
  return (
    <SignedOut>
      <div className="w-full min-h-dvh flex items-center justify-center">
        <SignUp fallback={<Loading />} />
      </div>
    </SignedOut>
  );
}
