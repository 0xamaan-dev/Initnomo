import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "./providers";
import { PostHogProvider } from "@/lib/posthog/PostHogProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://initnomo.vercel.app'),
  title: "Initnomo - Initia-focused binary options trading",
  description:
    "Initia-focused on-chain binary options trading app with oracle-backed settlement.",
  keywords: [
    "binary options",
    "crypto trading",
    "Pyth oracle",
    "Initia",
    "Web3",
    "prediction",
  ],
  icons: {
    icon: "/overflowlogo.ico",
    shortcut: "/overflowlogo.ico",
    apple: "/overflowlogo.ico",
  },
  openGraph: {
    title: "Initnomo — Initia-focused binary options trading",
    description:
      "Initia-focused on-chain binary options trading app with oracle-backed settlement.",
    images: [{ url: '/overflowlogo.png', width: 512, height: 512, alt: 'Initnomo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Initnomo — Initia-focused binary options trading",
    description: "Trade binary options on Initia with oracle-bound resolution.",
    images: ['/overflowlogo.png'],
  },
};

import { Header } from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased bg-[#02040a] text-white h-screen overflow-hidden flex flex-col`}
      >
        <PostHogProvider>
          <Providers>
            <Header />
            {/* Body is h-screen overflow-hidden: this must scroll or every page taller than the viewport is clipped. */}
            <main className="flex-1 relative flex flex-col min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
              {children}
            </main>
          </Providers>
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
