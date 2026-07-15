import React from "react";
import { motion } from "motion/react";

interface FloatItem {
  id: number;
  type: "paw" | "cat" | "heart" | "star";
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function BackgroundDecoration() {
  // Generate a stable set of floating symbols distributed across the screen
  const items: FloatItem[] = React.useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const types: Array<"paw" | "cat" | "heart" | "star"> = ["paw", "cat", "heart", "star"];
      return {
        id: i,
        type: types[i % types.length],
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        size: Math.random() * 24 + 16, // 16px to 40px
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 15, // 15s to 25s
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none opacity-[0.04]">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ 
            x: `${item.x}vw`, 
            y: "110vh", 
            rotate: 0, 
            opacity: 0 
          }}
          animate={{
            y: "-10vh",
            rotate: [0, 15, -15, 0],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: item.size,
            height: item.size,
          }}
          className="text-stone-800"
        >
          {item.type === "paw" && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M12 14c-1.66 0-3 1.34-3 3 0 2 2 3 3 3s3-1 3-3c0-1.66-1.34-3-3-3zm-4.5-3c-1.1 0-2 .9-2 2s.5 2 1.5 2 1.5-1 1.5-2c0-1.1-.9-2-1.5-2zm9 0c-.6 0-1.5.9-1.5 2 0 1 .5 2 1.5 2s1.5-.9 1.5-2-.9-2-1.5-2zm-6.5-4C9.13 7 8 8.12 8 9.5 8 11 9.5 11.5 10 11.5s1.5-.5 1.5-2C11.5 8.12 10.87 7 10 7zm4 0c-.87 0-1.5 1.12-1.5 2.5 0 1.5.83 2 1.5 2s2-.5 2-2C16 8.12 14.87 7 14 7z" />
            </svg>
          )}
          {item.type === "cat" && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.6 8.4-.1-.5-.1-1-.1-1.5 0-3.3 2.7-6 6-6s6 2.7 6 6c0 .5 0 1-.1 1.5 2.8-1.8 4.6-4.9 4.6-8.4 0-5.5-4.5-10-10-10zm-3.5 9c-.8 0-1.5-.7-1.5-1.5S7.7 8 8.5 8s1.5.7 1.5 1.5S9.3 11 8.5 11zm7 0c-.8 0-1.5-.7-1.5-1.5S14.7 8 15.5 8s1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" />
            </svg>
          )}
          {item.type === "heart" && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
          {item.type === "star" && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}
