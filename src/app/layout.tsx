import type { Metadata, Viewport } from "next";
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
  title: "GeoWorld · Nuestro Planeta Tierra",
  description:
    "Explora la Tierra en 3D: continentes, océanos, atmósfera y las capas que hacen posible la vida.",
  applicationName: "GeoWorld",
  keywords: ["Tierra", "planeta", "capas de la Tierra", "educación", "3D"],
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-black`}
    >
      <body className="min-h-svh bg-black font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
