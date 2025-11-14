import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ConsoleErrorSuppressor from "@/components/ConsoleErrorSuppressor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriClime Sentinel - Advanced Climate & Atmospheric Science Platform",
  description:
    "Dual-mode climate monitoring platform combining agricultural risk assessment with atmospheric science. Track weather alerts, severe weather indices, air quality, climate trends, drought, soil moisture, and crop risks across all 3,221 U.S. counties with 55 years of historical data.",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
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
        <ConsoleErrorSuppressor />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
