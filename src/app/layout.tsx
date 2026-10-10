import type { Metadata } from "next";
import "@/styles/tokens.css";
import "@/styles/motion.css";
import "./globals.css";
import NebulaBackground from "@/components/NebulaBackground";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProgressDock from "@/components/motion/ProgressDock";

export const metadata: Metadata = {
  title: "The Embrione - Web Dev Onboarding",
  description: "High-End Recruitment Portal & Moderation System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased min-h-screen relative overflow-x-hidden pt-[var(--header-height)]">
        {/* Dynamic WebGL shader nebula across ALL pages (Home, Register, Admin, Team) */}
        <NebulaBackground />
        <Header />
        <main className="relative z-10">{children}</main>
        <ProgressDock />
        <Footer />
      </body>
    </html>
  );
}