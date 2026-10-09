'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Adjust path if needed (e.g. '@/lib/supabase')

interface Member {
  id: string;
  full_name: string;
  srn: string;
  domain: string;
  position: string;
  branch: string;
  semester: string;
  email: string;
  linkedin_url?: string;
  github_url?: string;
  bio?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function AdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState(true);

  // Load submissions from Supabase + LocalStorage
  const loadMembers = async () => {
    setLoading(true);
    let supabaseData: Member[] = [];

    try {
      const { data, error } = await supabase.from('members').select('*');
      if (!error && data) {
        supabaseData = data as Member[];
      }
    } catch (err) {
      console.warn('Supabase fetch error, relying on local storage:', err);
    }

    const localData: Member[] = JSON.parse(localStorage.getItem('pending_members') || '[]');

    // Merge without duplicates based on id or SRN
    const combinedMap = new Map<string, Member>();
    [...localData, ...supabaseData].forEach((item) => {
      const key = item.id || item.srn;
      if (key) combinedMap.set(key, item);
    });

    setMembers(Array.from(combinedMap.values()));
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Handle Approve / Reject action
  const handleStatusUpdate = async (idOrSrn: string, newStatus: 'approved' | 'rejected') => {
    // 1. Update UI state immediately
    setMembers((prev) =>
      prev.map((item) => {
        if (item.id === idOrSrn || item.srn === idOrSrn) {
          return { ...item, status: newStatus };
        }
        return item;
      })
    );

    // 2. Update LocalStorage fallback immediately
    const localData: Member[] = JSON.parse(localStorage.getItem('pending_members') || '[]');
    const updatedLocal = localData.map((item) => {
      if (item.id === idOrSrn || item.srn === idOrSrn) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    localStorage.setItem('pending_members', JSON.stringify(updatedLocal));

    // 3. Attempt Supabase DB update
    try {
      await supabase
        .from('members')
        .update({ status: newStatus })
        .or(`id.eq.${idOrSrn},srn.eq.${idOrSrn}`);
    } catch (err) {
      console.warn('Supabase status update failed, local fallback saved:', err);
    }
  };

  const filteredMembers = members.filter((m) => (filter === 'all' ? true : m.status === filter));

  return (
    <div className="w-full max-w-6xl mx-auto px-6 pt-12 pb-16 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Admin Moderation Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Review and moderate onboarding registrations</p>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-mono text-sm">Loading registrations...</div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 font-mono text-sm backdrop-blur-md">
          No registrations found under status &quot;{filter}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMembers.map((member) => {
            const key = member.id || member.srn;
            return (
              <div
                key={key}
                className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 shrink-0">
                    {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-slate-100 font-bold text-lg leading-tight truncate">
                      {member.full_name}
                    </h3>
                    <p className="text-slate-400 text-xs font-mono mt-0.5">{member.srn}</p>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{member.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                  <span className="bg-sky-950/80 border border-sky-500/40 text-sky-300 px-2.5 py-0.5 rounded-full">
                    {member.domain}
                  </span>
                  <span className="bg-purple-950/80 border border-purple-500/40 text-purple-300 px-2.5 py-0.5 rounded-full">
                    {member.position}
                  </span>
                  <span className="bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">
                    {member.branch} • Sem {member.semester}
                  </span>
                </div>

                {member.bio && (
                  <p className="text-slate-400 italic text-xs line-clamp-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
                    &quot;{member.bio}&quot;
                  </p>
                )}

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      member.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : member.status === 'rejected'
                        ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {member.status}
                  </span>

                  {member.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusUpdate(key, 'approved')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(key, 'rejected')}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}