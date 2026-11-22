import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TubeMind — YouTube AI Analyzer",
  description: "Extract transcripts, understand videos, and study natural speaking patterns with AI."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}