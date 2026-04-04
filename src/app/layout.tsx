import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CityProvider } from "@/lib/CityContext";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sydney Entertainment Hub — Cinema, Culture & Streaming",
  description:
    "Sydney · Shanghai · Suzhou · Changzhou — your multi-city guide to cinemas, exhibitions, performances, and what to stream tonight. Triple-rated with IMDb, Rotten Tomatoes & Douban.",
  openGraph: {
    title: "Sydney Entertainment Hub",
    description: "Going out or staying in? Multi-city cinema, culture & streaming guide.",
    type: "website",
    siteName: "Sydney Entertainment Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sydney Entertainment Hub",
    description: "Multi-city cinema, culture & streaming guide — Sydney · Shanghai · Suzhou · Changzhou",
  },
  metadataBase: new URL("https://sydneycinema.xyz"),
};

export const viewport = {
  themeColor: "#0a0018",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning><CityProvider>{children}</CityProvider><Analytics /></body>
    </html>
  );
}
