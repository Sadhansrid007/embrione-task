'use client';

import { useEffect, useState } from 'react';

interface ChapterInfo {
  id: string;
  label: string;
}

const CHAPTERS: ChapterInfo[] = [
  { id: 'intro', label: 'Intro' },
  { id: 'register', label: 'Onboarding' },
  { id: 'directory', label: 'Team' },
  { id: 'admin', label: 'Moderation' },
];

export default function ProgressDock() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      setScrollProgress(progress);

      // Determine active chapter index
      const chapterIndex = Math.min(
        Math.floor(progress * CHAPTERS.length),
        CHAPTERS.length - 1
      );
      setActiveChapter(chapterIndex);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToChapter = (index: number) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = (index / (CHAPTERS.length - 1)) * maxScroll;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-4 transition-transform duration-500">
      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
        {CHAPTERS[activeChapter].label}
      </span>

      {/* Chapter Indicator Dots */}
      <div className="flex items-center gap-2.5">
        {CHAPTERS.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => scrollToChapter(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === activeChapter
                ? 'bg-indigo-400 scale-125 shadow-[0_0_8px_rgba(129,140,248,0.8)]'
                : 'bg-slate-700 hover:bg-slate-500'
            }`}
            title={ch.label}
            aria-label={`Jump to ${ch.label}`}
          />
        ))}
      </div>

      {/* Scroll Progress Bar */}
      <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-150"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </div>
  );
}