import type { Metadata } from "next";
import "@/styles/tokens.css";
import "@/styles/motion.css";
import "./globals.css";
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
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen relative overflow-x-hidden pt-[var(--header-height)]">
        {/* Drifting Aurora Blobs */}
        <div className="aurora-container">
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-2" />
          <div className="aurora-blob aurora-blob-3" />
        </div>

        {/* Film Grain Texture Overlay */}
        <div className="grain-overlay" />

        <Header />
        <main className="relative z-10">{children}</main>
        <ProgressDock />
        <Footer />
      </body>
    </html>
  );
}