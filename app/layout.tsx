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
  title: {
    default: "Afilo | High-Performance Web Systems for Local Service Contractors",
    template: "%s | Afilo",
  },
  description:
    "Afilo replaces slow, outdated websites for HVAC, plumbers, electricians, and dental clinics with high-performance web systems and automated lead-dispatch engines.",
  openGraph: {
    title: "Afilo | High-Performance Web Systems",
    description: "Replace your outdated website with a high-performance lead machine.",
    url: "https://afilo.io",
    siteName: "Afilo",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
