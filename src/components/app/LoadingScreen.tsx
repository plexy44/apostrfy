"use client";

import { SiliconShape } from "@/components/icons/SiliconShape";
import { LITERARY_PLACEHOLDERS } from "@/lib/constants";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  text?: string;
}

export default function LoadingScreen({ text }: LoadingScreenProps) {
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    if (text) {
      setPlaceholder(text);
    } else {
      setPlaceholder(LITERARY_PLACEHOLDERS[Math.floor(Math.random() * LITERARY_PLACEHOLDERS.length)]);
    }
  }, [text]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden z-[100] animate-fade-in">
        <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
                <SiliconShape key={i} />
            ))}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-accent rounded-full animate-pulse shadow-[0_0_30px] shadow-accent/50"></div>
            <p className="mt-8 text-lg font-headline text-foreground/80 max-w-xs">
                {placeholder}
            </p>
        </div>
    </div>
  );
}
