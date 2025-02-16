import type { Metadata } from "next";
import { Poppins, PT_Sans } from "next/font/google";
import Navigation from "@/components/navigation";
import { DatabaseInitializer } from "@/components/DatabaseInitializer";
import "./globals.css";

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

const ptSans = PT_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: "Productivity Playlists",
  description: "Manage your daily tasks efficiently",
  manifest: '/manifest.json',
  themeColor: '#18314f',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Productivity Playlists"
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" 
        />
        <meta name="format-detection" content="telephone=no" />
        <style>{`
          input, textarea, select {
            font-size: 16px !important;
          }
          @supports (-webkit-touch-callout: none) {
            .min-h-screen {
              min-height: -webkit-fill-available;
            }
            html {
              height: -webkit-fill-available;
            }
          }
        `}</style>
      </head>
      <body className={`${poppins.variable} ${ptSans.variable} font-pt-sans bg-gray-50 text-text-primary`}>
        <DatabaseInitializer>
          <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg pb-16">
            {children}
            <Navigation />
          </div>
        </DatabaseInitializer>
      </body>
    </html>
  );
} 