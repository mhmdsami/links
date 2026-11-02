import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const monaSans = localFont({
  src: [
    { path: "./fonts/MonaSans-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/MonaSans-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/MonaSans-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-mona",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://links.sam1.space"),
  title: "links",
  description: "A short-link collection.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "links",
    description: "Short links, kept simple.",
    siteName: "links",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "links",
    description: "Short links, kept simple.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${monaSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
