import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🎯 Kosingasi Kviz",
  description: "Real-time multiplayer kviz sa pitanjima na srpskom jeziku. Takmičite se sa prijateljima i osvojite najviše poena!",
  openGraph: {
    title: "🎯 Kosingasi Kviz",
    description: "Real-time multiplayer kviz sa pitanjima na srpskom jeziku. Takmičite se sa prijateljima i osvojite najviše poena!",
    type: "website",
    locale: "sr_RS",
    siteName: "Kosingasi Kviz",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&h=630&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Kosingasi Kviz - Multiplayer Quiz Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🎯 Kosingasi Kviz",
    description: "Real-time multiplayer kviz sa pitanjima na srpskom jeziku. Takmičite se sa prijateljima i osvojite najviše poena!",
    images: ["https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&h=630&fit=crop&q=80"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
