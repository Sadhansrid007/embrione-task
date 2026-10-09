'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full h-[var(--header-height)] z-50 bg-[#090d16]/80 backdrop-blur-md border-b border-slate-800/60 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block animate-pulse" />
          The Embrione
        </Link>
        <select
          className="bg-slate-900 border border-slate-700/80 text-slate-300 text-xs rounded px-2 py-1 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
          defaultValue="v4.0.0"
        >
          <option value="v4.0.0">v4.0.0 (Latest)</option>
          <option value="v3.2.1">v3.2.1</option>
        </select>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <Link href="/register" className="hover:text-indigo-400 transition-colors">Register</Link>
        <Link href="/team" className="hover:text-indigo-400 transition-colors">Meet The Team</Link>
        <Link href="/admin" className="hover:text-indigo-400 transition-colors">Admin Panel</Link>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="hover:text-indigo-400 transition-colors font-mono text-xs bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-md"
        >
          GitHub ↗
        </a>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-slate-300 focus:outline-none p-1"
        aria-label="Toggle Navigation"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          {mobileMenuOpen ? (
            <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 01-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 01-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 011.414-1.414l4.829 4.828 4.828-4.828a1 1 0 011.414 1.414l-4.828 4.829 4.828 4.828z" />
          ) : (
            <path fillRule="evenodd" d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z" />
          )}
        </svg>
      </button>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-[var(--header-height)] left-0 w-full bg-slate-950/95 border-b border-slate-800 p-6 flex flex-col gap-4 md:hidden backdrop-blur-xl">
          <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-slate-200 text-base font-medium">Register</Link>
          <Link href="/team" onClick={() => setMobileMenuOpen(false)} className="text-slate-200 text-base font-medium">Meet The Team</Link>
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-slate-200 text-base font-medium">Admin Panel</Link>
        </div>
      )}
    </header>
  );
}