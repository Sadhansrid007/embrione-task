'use client';

import { useState } from 'react';

interface CodeCardProps {
  chapterId: string;
  filename: string;
  code: string;
}

export default function CodeCard({ filename, code }: CodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl font-mono text-xs text-slate-300">
      <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between">
        <span className="text-slate-400 font-medium">{filename}</span>
        <button
          onClick={handleCopy}
          className="text-slate-500 hover:text-slate-200 text-[10px] uppercase tracking-wider transition-colors"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}