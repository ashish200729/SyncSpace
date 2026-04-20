import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ReactNode } from "react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

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
      <body className={`${manrope.variable} min-h-screen flex flex-col`}>
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}