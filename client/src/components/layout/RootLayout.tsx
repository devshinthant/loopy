import { Toaster } from "../ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh relative overflow-hidden w-dvw">
      {children}
      <Toaster />
    </div>
  );
}
