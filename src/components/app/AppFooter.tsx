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
          <Link href="/about-us" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/past-stories" className="hover:text-foreground transition-colors">Past Stories</Link>
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
        </div>
        <ThemeToggle />
      </div>
    </footer>
  );
}
