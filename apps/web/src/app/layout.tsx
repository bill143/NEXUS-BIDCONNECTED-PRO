import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "BidConnect Pro",
    template: "%s | BidConnect Pro",
  },
  description:
    "Construction Bid Management Platform. Streamline your preconstruction workflow with intelligent bid management, subcontractor qualification, and real-time collaboration.",
  keywords: [
    "construction",
    "bid management",
    "preconstruction",
    "general contractor",
    "subcontractor",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased scrollbar-dark`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
