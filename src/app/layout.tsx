import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { _Layout } from "@/components/Layout/_Layout";
import { Suspense } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BuchstaBiene",
  description:
    "Finde alle Wörter, die du aus den Buchstaben zusammen setzen kannst.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark bg-background text-foreground antialiased`}
      >
        <_Layout>
          <Suspense fallback={<div>Lädt...</div>}>{children}</Suspense>
        </_Layout>
      </body>
    </html>
  );
}
