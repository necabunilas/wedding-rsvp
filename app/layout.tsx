import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import MusicPlayer from "@/components/MusicPlayer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nic & Ban Wedding RSVP",
  description: "RSVP for Nic & Ban's Wedding - June 20, 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
      <head>
        <link rel="preload" href="/music/background.mp3" as="audio" />
      </head>
      <body className="min-h-screen bg-wedding-off-white font-sans antialiased">
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}
