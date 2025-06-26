"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export function SiliconShape() {
  const animationProps = useMemo(() => {
    const duration = Math.random() * 20 + 20; // 20-40s
    const delay = Math.random() * 10; // 0-10s
    const xRange = [-10, 110];
    const yRange = [-10, 110];
    const rotateRange = [0, 360];

    return {
      initial: {
        x: `${Math.random() * 100}vw`,
        y: `${Math.random() * 100}vh`,
        rotate: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.3,
      },
      animate: {
        x: `${xRange[0] + Math.random() * (xRange[1] - xRange[0])}vw`,
        y: `${yRange[0] + Math.random() * (yRange[1] - yRange[0])}vh`,
        rotate: rotateRange[0] + Math.random() * (rotateRange[1] - rotateRange[0]),
      },
      transition: {
        duration,
        delay,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
      },
    };
  }, []);

  return (
    <motion.div
      className="absolute"
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
    >
      <svg
        width="150"
        height="150"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 0C77.6142 0 100 22.3858 100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 35.5326 7.07595 22.6534 18.1818 15.1515C29.2878 7.64965 43.1415 11.3636 50 20C56.8585 28.6364 64.6465 24.2424 71.7172 18.1818C82.9241 8.98934 91.0107 23.3858 85 35C78.9893 46.6142 85 64.6465 75 75C65 85.3535 53.3858 78.9893 45 85C36.6142 91.0107 24.2424 82.9241 15.1515 71.7172C6.06061 60.5103 14.6465 43.1415 20 35C25.3535 26.8585 35.5326 14.8485 50 0Z"
          className="stroke-current text-accent/30"
          strokeWidth="0.5"
        />
      </svg>
    </motion.div>
  );
}
