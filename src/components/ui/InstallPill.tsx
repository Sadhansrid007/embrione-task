'use client';

import { useState } from 'react';

export default function InstallPill({ command = 'npm run dev' }: { command?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-2 font-mono text-xs text-slate-300 shadow-xl backdrop-blur-md">
      <span className="text-indigo-400">$</span>
      <code>{command}</code>
      <button
        onClick={handleCopy}
        className="ml-2 p-1 text-slate-400 hover:text-slate-100 transition-colors focus:outline-none"
        title="Copy command"
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <svg className="w-4 h-4 stroke-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
        )}
      </button>
    </div>
  );
}