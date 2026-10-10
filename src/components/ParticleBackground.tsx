'use client';

export default function ParticleBackground({ accentColor = '#818cf8' }: { accentColor?: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950">
      {/* Dynamic Animated Nebula Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen scale-110 animate-nebula-drift transition-all duration-1000"
        style={{
          backgroundImage: `url('/nebula.jpg')`,
          filter: `hue-rotate(0deg) contrast(1.15)`,
        }}
      />

      {/* Pulsing Accent Glow Overlay */}
      <div
        className="absolute inset-0 opacity-30 transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accentColor}33 0%, transparent 70%)`,
        }}
      />

      {/* Dark Vignette to keep text high contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/90" />
    </div>
  );
}