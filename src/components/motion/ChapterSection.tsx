'use client';

import { ReactNode } from 'react';

interface ChapterSectionProps {
  chapterId: string;
  label: string;
  colorClass?: string;
  isLight?: boolean;
  spacersCount?: number;
  children: ReactNode;
}

export default function ChapterSection({
  chapterId,
  label,
  colorClass = 'color-indigo',
  isLight = false,
  spacersCount = 3,
  children,
}: ChapterSectionProps) {
  return (
    <section
      data-chapter={chapterId}
      data-label={label}
      data-light={isLight ? 'true' : 'false'}
      className={`relative w-full ${colorClass} ${isLight ? 'section-light' : ''}`}
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-[var(--header-height)] w-full h-[calc(100vh-var(--header-height))] flex items-center justify-center overflow-hidden z-10">
        <div className="fixed-section w-full max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          {children}
        </div>
      </div>

      {/* Scroll Runway Spacers (Creates Viewport Scroll Distance for Anime.js Scrubbing) */}
      <div className="relative z-0 pointer-events-none">
        {Array.from({ length: spacersCount }).map((_, i) => (
          <div key={i} className="section-spacer h-[60vh] w-full" />
        ))}
      </div>
    </section>
  );
}