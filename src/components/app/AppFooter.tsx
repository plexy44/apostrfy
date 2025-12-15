/**
 * @fileoverview This component renders the main application footer. It includes
 * navigation links for About, Privacy, and Terms, as well as a theme toggle.
 *
 * - AppFooter - The component that renders the application footer.
 */
"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";
import { BookOpenCheck } from "lucide-react";

export default function AppFooter() {
  return (
    <footer className="w-full p-2 md:p-4 mt-auto">
      <div className="container mx-auto max-w-4xl glassmorphism rounded-lg p-2 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <Link href="/about-us" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/hall-of-fame" className="flex items-center gap-2 hover:text-foreground transition-colors">
            <BookOpenCheck className="h-4 w-4" />
            Hall of Fame
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
