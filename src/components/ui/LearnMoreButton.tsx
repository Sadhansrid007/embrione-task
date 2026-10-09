'use client';

export default function LearnMoreButton({ targetId = 'register' }: { targetId?: string }) {
  const handleScroll = () => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={handleScroll}
      className="group inline-flex flex-col items-center gap-1 text-xs font-mono text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
    >
      <span>LEARN MORE</span>
      <div className="flex flex-col -space-y-1.5 items-center">
        <svg className="w-4 h-4 animate-bounce text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        <svg className="w-4 h-4 opacity-40 group-hover:opacity-80 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
}