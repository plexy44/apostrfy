/**
 * @fileoverview This is the root layout for the Next.js application.
 * It defines the main HTML structure, includes global stylesheets and fonts,
 * and wraps all page content. It also provides a `Toaster` component for notifications.
 */
import type {Metadata, Viewport} from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Apostrfy',
  description: 'connect || co-create',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
        
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7132522800049597" 
          crossOrigin="anonymous" 
          strategy="afterInteractive"
        ></Script>
        
        {/* <!-- Google tag (gtag.js) --> */}
        <Script 
          async 
          src="https://www.googletagmanager.com/gtag/js?id=G-7JK1BH6Y8R" 
          strategy="afterInteractive"
        ></Script>
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7JK1BH6Y8R');
          `}
        </Script>
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
