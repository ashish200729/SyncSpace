import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ReactNode } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope"
});

export const metadata: Metadata = {
  title: "SyncSpace Frontend",
  description: "Next.js frontend app with Tailwind CSS"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={manrope.variable}>{children}</body>
    </html>
  );
}