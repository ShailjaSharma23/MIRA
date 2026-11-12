import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIRA - Next-Gen AI Assistant",
  description: "ChatGPT & Gemini grade AI platform with modular plugins, live web grounding, and persistent memory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-[#131314] text-[#E3E3E3] font-sans flex flex-col selection:bg-purple-500/30">
        {children}
      </body>
    </html>
  );
}
