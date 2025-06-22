import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingEmojiProps {
  emoji: string;
  id: string;
  onComplete: () => void;
  position?: { x: number; y: number };
}

export default function FloatingEmoji({
  emoji,
  id,
  onComplete,
  position,
}: FloatingEmojiProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate deterministic positions based on the emoji id
  const getPositionFromId = (emojiId: string) => {
    let hash = 0;
    for (let i = 0; i < emojiId.length; i++) {
      const char = emojiId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const x = (Math.abs(hash) % 80) + 10; // 10% to 90% of container width
    const y = (Math.abs(hash >> 8) % 60) + 20; // 20% to 80% of container height
    const drift = ((hash >> 16) % 120) - 60; // -60 to +60 for horizontal drift

    return { x, y, drift };
  };

  const {
    x: randomX,
    y: randomY,
    drift: randomDrift,
  } = position
    ? { x: position.x, y: position.y, drift: (Math.random() - 0.5) * 60 }
    : getPositionFromId(id);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={id}
          initial={{
            opacity: 0,
            scale: 0.3,
            y: randomY,
            x: randomX,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.3, 1.2, 1, 1.1],
            y: [randomY, randomY - 50, randomY - 100, randomY - 200],
            x: [
              randomX,
              randomX + randomDrift * 0.3,
              randomX + randomDrift * 0.6,
              randomX + randomDrift,
            ],
          }}
          transition={{
            duration: 2.5,
            ease: "easeOut",
            times: [0, 0.1, 0.8, 1],
          }}
          className="absolute pointer-events-none z-50"
          style={{
            left: `${randomX}%`,
            top: `${randomY}%`,
          }}
        >
          <div className="text-4xl md:text-5xl lg:text-6xl select-none drop-shadow-lg">
            {emoji}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
