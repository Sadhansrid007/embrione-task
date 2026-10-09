'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import MemberCard from '@/components/MemberCard';

interface Member {
  id: string;
  name: string;
  domain: string;
  position: string;
  srn: string;
  branch: string;
  semester: number;
  bio: string;
  photo_url: string;
  linkedin_url?: string;
  github_url?: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  useEffect(() => {
    const fetchApprovedMembers = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'approved')
        .order('name', { ascending: true });

      if (!error && data) {
        setMembers(data);
      }
      setLoading(false);
    };

    fetchApprovedMembers();
  }, []);

  const domains = ['All', ...Array.from(new Set(members.map((m) => m.domain)))];

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.srn.toLowerCase().includes(search.toLowerCase()) ||
      m.domain.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || m.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Meet The Team
          </h1>
          <p className="text-slate-400 text-sm">
            Discover the core leads and registered members powering The Embrione.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Search by name, SRN, or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none text-slate-100"
          />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none text-slate-100"
          >
            {domains.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Domains' : d}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading directory...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400">
            No approved team members found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                name={member.name}
                domain={member.domain}
                position={member.position}
                srn={member.srn}
                branch={member.branch}
                semester={member.semester}
                bio={member.bio}
                photoUrl={member.photo_url}
                linkedinUrl={member.linkedin_url}
                githubUrl={member.github_url}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}