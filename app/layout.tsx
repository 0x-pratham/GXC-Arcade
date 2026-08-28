// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import GlobalPopup from "../components/GlobalPopup";
import EngineeringBackground from "../components/EngineeringBackground";

export const metadata: Metadata = {
  title: "GXC Arcade | Premium Mini-Games",
  description: "Test your reflexes, memory, and cognitive skills in this luxury minimal arcade. Play Reaction Rush, Number Ninja, and more!",
  icons: {
    icon: "/icon.svg", // Browser tab ke liye SVG sharp dikhega
    apple: "/icon.png", // iOS homescreen shortcut ke liye PNG
  },
  openGraph: {
    title: "GXC Arcade | Premium Mini-Games",
    description: "Step into the ultimate cognitive training arcade.",
    url: "https://your-hosted-domain.com", // APNA ACTUAL HOSTED URL YAHAN DAALNA
    siteName: "GXC Arcade",
    images: [
      {
        url: "/icon.png", // Link preview me ab aapka PNG logo aayega!
        width: 1200,
        height: 630,
        alt: "GXC Arcade Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GXC Arcade | Premium Mini-Games",
    description: "Step into the ultimate cognitive training arcade.",
    images: ["/icon.png"], // Twitter preview ke liye PNG
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-[#220849] antialiased flex flex-col min-h-screen overflow-x-hidden selection:bg-[#5f2396] selection:text-white bg-transparent">
        
        {/* GLOBAL DYNAMIC BACKGROUND */}
        <EngineeringBackground />
        
        <Navbar />
        
        {/* Main Content Wrapper */}
        <div className="flex-grow w-full flex flex-col relative z-10">
          {children}
        </div>
        
        <GlobalPopup />
      </body>
    </html>
  );
}