import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navigation from "@/components/navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Productivity Playlists",
  description: "Manage your daily tasks efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-sm pb-16">
          {children}
          <Navigation />
        </div>
      </body>
    </html>
  );
} 