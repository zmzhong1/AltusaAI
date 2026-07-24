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
  title: "Altusa — Connected operations for growing product businesses",
  description:
    "Altusa connects orders, inventory, warehouse operations, ecommerce, and accounting for product-based small businesses.",
  metadataBase: new URL("https://altusa-ai-company.web.app"),
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/favicon.png",
    apple: [{ url: "/favicon.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "Altusa — Your systems should work like one.",
    description:
      "Connected operations, managed modernization, and practical AI for growing product businesses.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1729,
        height: 910,
        alt: "Altusa — Your systems should work like one.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Altusa — Your systems should work like one.",
    description:
      "Connected operations, managed modernization, and practical AI for growing product businesses.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
