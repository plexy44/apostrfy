"use client";

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
    const [isDark, setIsDark] = React.useState(true);

    React.useEffect(() => {
      const root = window.document.documentElement;
      if(isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }, [isDark]);


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
