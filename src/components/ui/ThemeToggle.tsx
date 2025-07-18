"use client";

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
    const [isDark, setIsDark] = React.useState(true);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
      const root = window.document.documentElement;
      if(isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }, [isDark]);

    if (!mounted) {
        // Render a placeholder or null on the server and initial client render
        return (
            <div className="flex items-center space-x-2 h-[24px]">
                <Sun className="h-[1.2rem] w-[1.2rem]" />
                <div className="w-11 h-6 bg-input rounded-full" />
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            </div>
        );
    }

  return (
    <div className="flex items-center space-x-2">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <Switch
            checked={isDark}
            onCheckedChange={setIsDark}
            aria-label="Toggle theme"
        />
        <Moon className="h-[1.2rem] w-[1.2rem]" />
    </div>
  )
}
