import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface FloatingEmoji {
  id: string;
  emoji: string;
  position?: { x: number; y: number };
}

interface FloatingEmojisContextType {
  floatingEmojis: FloatingEmoji[];
  triggerEmoji: (emoji: string, position?: { x: number; y: number }) => void;
  removeEmoji: (id: string) => void;
}

const FloatingEmojisContext = createContext<
  FloatingEmojisContextType | undefined
>(undefined);

export const FloatingEmojisProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  const triggerEmoji = useCallback(
    (emoji: string, position?: { x: number; y: number }) => {
      const id = `${emoji}-${Date.now()}-${Math.random()}`;
      setFloatingEmojis((prev) => [...prev, { id, emoji, position }]);
    },
    []
  );

  const removeEmoji = useCallback((id: string) => {
    setFloatingEmojis((prev) => prev.filter((emoji) => emoji.id !== id));
  }, []);

  return (
    <FloatingEmojisContext.Provider
      value={{ floatingEmojis, triggerEmoji, removeEmoji }}
    >
      {children}
    </FloatingEmojisContext.Provider>
  );
};

export function useFloatingEmojisContext() {
  const ctx = useContext(FloatingEmojisContext);
  if (!ctx)
    throw new Error(
      "useFloatingEmojisContext must be used within FloatingEmojisProvider"
    );
  return ctx;
}
