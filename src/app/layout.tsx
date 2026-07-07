import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SolanaProvider } from "@/components/providers/solana-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DispatchAssistant } from "@/components/dispatch-assistant";
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
  title: "Veritair — drone delivery, proven on Solana Devnet",
  description:
    "A drone delivery network for the places couriers can't reach, with every hub, pad, and delivery confirmation recorded on Solana Devnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SolanaProvider>
          <TooltipProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <DispatchAssistant />
          </TooltipProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
