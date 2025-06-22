import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Smile } from "lucide-react";
import { useFloatingEmojisContext } from "@/contexts/FloatingEmojisContext";
import { socket } from "@/lib/socket";
import { useParams } from "react-router";
import useObserveReactions from "@/hooks/useObserveReactions";

const EMOJI_REACTIONS = [
  { emoji: "❤️", label: "Heart" },
  { emoji: "👏", label: "Applause" },
  { emoji: "🎉", label: "Celebration" },
  { emoji: "👍", label: "Thumbs Up" },
  { emoji: "👎", label: "Thumbs Down" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Surprised" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "💯", label: "100" },
  { emoji: "🚀", label: "Rocket" },
  { emoji: "⭐", label: "Star" },
];

export default function Reaction() {
  const { triggerEmoji } = useFloatingEmojisContext();
  const params = useParams();
  const roomId = params.roomId as string;

  const handleEmojiClick = (emoji: string) => {
    socket.emit("send-emoji-reaction", { roomId, emoji });
    triggerEmoji(emoji);
  };

  useObserveReactions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-md cursor-pointer border-gray-700 hover:bg-gray-800 bg-gray-900 transition-colors duration-200"
        >
          <Smile className="h-5 w-5 text-white transition-colors duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border border-gray-700 p-3 min-w-[280px]">
        <DropdownMenuLabel className="text-gray-300 text-center font-medium">
          Reactions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700 my-2" />
        <div className="grid grid-cols-4 gap-2">
          {EMOJI_REACTIONS.map((reaction) => (
            <DropdownMenuItem
              key={reaction.emoji}
              className="text-gray-200 hover:bg-gray-800 cursor-pointer p-2 rounded-md flex flex-col items-center justify-center gap-1 transition-colors duration-150"
              onClick={() => handleEmojiClick(reaction.emoji)}
            >
              <span className="text-2xl">{reaction.emoji}</span>
              <span className="text-xs text-gray-400">{reaction.label}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
