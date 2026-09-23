import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LEXORA LITE — Understand Before You Sign",
  description:
    "AI-powered legal document understanding MVP. Transform complex contracts into plain-language summaries, extracted clauses, obligations, and verified evidence using Google Gemini.",
  keywords: [
    "legal ai",
    "contract analysis",
    "plain language",
    "legal document understanding",
    "gemini ai",
    "promptwars",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50/50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
