import FloatingEmoji from "./FloatingEmoji";
import { useFloatingEmojisContext } from "@/contexts/FloatingEmojisContext";

const FloatingEmojiContainer = () => {
  const { floatingEmojis, removeEmoji } = useFloatingEmojisContext();

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {floatingEmojis.map(
        (emoji: {
          id: string;
          emoji: string;
          position?: { x: number; y: number };
        }) => (
          <FloatingEmoji
            key={emoji.id}
            id={emoji.id}
            emoji={emoji.emoji}
            onComplete={() => removeEmoji(emoji.id)}
            position={emoji.position}
          />
        )
      )}
    </div>
  );
};

export default FloatingEmojiContainer;
