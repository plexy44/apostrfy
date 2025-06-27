/**
 * @fileoverview This component renders the main application footer.
 * It provides links for navigation (e.g., "About", "Past Stories") and
 * includes the theme toggle switch for light/dark mode.
 */
"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="w-full p-4 mt-auto">
      <div className="container mx-auto max-w-4xl glassmorphism rounded-lg p-2 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-foreground transition-colors">About</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Past Stories</Link>
        </div>
        <ThemeToggle />
      </div>
    </footer>
  );
}
