// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import GlobalPopup from "../components/GlobalPopup";
import EngineeringBackground from "../components/EngineeringBackground"; // <-- IMPORT ADDED

export const metadata: Metadata = {
  title: "GXC Arcade",
  description: "Premium Web Arcade Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Removed background color from body to let the global component shine through */}
      <body className="text-[#220849] antialiased flex flex-col min-h-screen overflow-x-hidden selection:bg-[#5f2396] selection:text-white bg-transparent">
        
        {/* GLOBAL DYNAMIC BACKGROUND */}
        <EngineeringBackground />
        
        <Navbar />
        
        {/* Main Content Wrapper - Handles automatic spacing and pushes footer down */}
        <div className="flex-grow w-full flex flex-col relative z-10">
          {children}
        </div>
        
        <GlobalPopup />
      </body>
    </html>
  );
}