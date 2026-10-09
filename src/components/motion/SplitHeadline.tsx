'use client';

import { useEffect, useRef } from 'react';

interface SplitHeadlineProps {
  text: string;
  accentWord?: string;
  className?: string;
}

export default function SplitHeadline({
  text,
  accentWord = "anything",
  className = "",
}: SplitHeadlineProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Anime.js v4 dynamic import for character staggered entrance
    import('animejs').then((animeModule) => {
      const { animate, stagger } = animeModule;

      if (containerRef.current) {
        const charElements = containerRef.current.querySelectorAll('.split-char');
        animate(charElements, {
          translateY: [30, 0],
          opacity: [0, 1],
          delay: stagger(35),
          duration: 800,
          ease: 'outCubic',
        });
      }
    });
  }, []);

  const words = text.split(' ');

  return (
    <h1 ref={containerRef} className={`relative font-bold leading-tight tracking-tight ${className}`}>
      {/* Screen Reader Full-Text Accessibility Copy */}
      <span className="sr-only">{text}</span>

      {/* Visual Split Characters */}
      <span aria-hidden="true" className="inline-flex flex-wrap gap-x-3 gap-y-1">
        {words.map((word, wIdx) => {
          const isAccent = word.toLowerCase().includes(accentWord.toLowerCase());
          return (
            <span key={wIdx} className="inline-block whitespace-nowrap">
              {word.split('').map((char, cIdx) => (
                <span
                  key={cIdx}
                  className={`split-char inline-block opacity-0 ${
                    isAccent ? 'text-indigo-400 drop-shadow-[0_0_12px_rgba(129,140,248,0.6)]' : ''
                  }`}
                >
                  {char}
                </span>
              ))}
              {wIdx === words.length - 1 && (
                <span className="split-char inline-block text-indigo-500 font-black opacity-0">.</span>
              )}
            </span>
          );
        })}
      </span>
    </h1>
  );
}