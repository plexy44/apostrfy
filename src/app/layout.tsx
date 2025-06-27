/**
 * @fileoverview This is the root layout for the Next.js application.
 * It defines the main HTML structure, includes global stylesheets and fonts,
 * and wraps all page content. It also provides a `Toaster` component for notifications.
 */
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Apostrfy',
  description: 'connect || co-create',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Inter:wght@400;600&family=Space+Grotesk:wght@400;700&family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <div className="flex-grow">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
