'use client';

export default function ParticleBackground({ accentColor = '#818cf8' }: { accentColor?: string }) {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
    >
      {/* Dynamic Animated Nebula Background */}
      <div
        className="animate-nebula-drift"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('/nebula.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.85,
          filter: 'contrast(1.1) brightness(1.1)',
        }}
      />

      {/* Radial Accent Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${accentColor}40 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Vignette Overlay for High Text Readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(2, 6, 23, 0.4), rgba(2, 6, 23, 0.7))',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}