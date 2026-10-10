import NebulaBackground from '@/components/NebulaBackground';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white relative antialiased">
        {/* Dynamic WebGL Shader Nebula across ALL pages (Home, Register, Admin, Team) */}
        <NebulaBackground />
        {children}
      </body>
    </html>
  );
}