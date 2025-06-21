import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle } from "lucide-react";

interface Props {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

export default function ChatNotiButton({ count, setCount }: Props) {
  return (
    <SheetTrigger
      onClick={() => {
        setCount(0);
      }}
      asChild
    >
      <Button
        variant="outline"
        className="rounded-md border-gray-700 bg-gray-900 hover:bg-gray-800 relative"
      >
        <MessageCircle className="h-5 w-5 text-white" />
        <p className="text-white text-xs">Chat</p>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {count}
          </span>
        )}
      </Button>
    </SheetTrigger>
  );
}
