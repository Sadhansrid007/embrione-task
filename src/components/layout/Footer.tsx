'use client';

import { useState } from 'react';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-12 px-6 md:px-16 text-sm">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-slate-100 font-bold text-base mb-3">The Embrione</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-performance web developer recruitment and onboarding visualizer built with Next.js, Three.js, and Anime.js.
          </p>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wider">Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="/register" className="hover:text-indigo-400 transition-colors">Onboarding Flow</a></li>
            <li><a href="/team" className="hover:text-indigo-400 transition-colors">Team Directory</a></li>
            <li><a href="/admin" className="hover:text-indigo-400 transition-colors">Moderation Panel</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wider">Resources</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">GitHub Repository</a></li>
            <li><a href="https://vercel.com" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">Deployment Docs</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wider">Newsletter</h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
            className="flex flex-col gap-2"
          >
            <input
              type="email"
              required
              placeholder="Enter developer email..."
              className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-1.5 rounded text-xs transition-colors"
            >
              {subscribed ? 'Subscribed ✓' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 The Embrione Task Portal. All rights reserved.</p>
      </div>
    </footer>
  );
}