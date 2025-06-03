import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full min-h-dvh h-full flex items-center justify-center bg-transparent">
      <Loader2 className="animate-spin" />
    </div>
  );
}
