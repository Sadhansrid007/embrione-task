'use client';

import { useEffect, useState } from 'react';
import ParticleCube from '@/components/ParticleCube';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    srn: '',
    domain: 'Web Development',
    position: 'Member',
    branch: 'CSE',
    semester: '1',
    email: '',
    linkedIn: '',
    gitHub: '',
    bio: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState('#818cf8');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Tint the global background (rendered in layout.tsx) to match the focused field
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('embrione:accent', { detail: accentColor }));
  }, [accentColor]);

  // Reset the background tint when leaving this page
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('embrione:accent', { detail: '#818cf8' }));
    };
  }, []);

  // Field calculation across ALL 10 text fields + photo option (11 total)
  const totalFields = 11;
  const filledCount =
    Object.values(formData).filter((v) => v.trim() !== '').length + (photoPreview ? 1 : 0);
  const completionRatio = filledCount / totalFields;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert uploaded photo to WebP format for high-speed live preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 240, 240);
          setPhotoPreview(canvas.toDataURL('image/webp', 0.85));
        }
      };
      if (event.target?.result) img.src = event.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newApplicant = {
      id: Date.now().toString(),
      full_name: formData.fullName,
      srn: formData.srn,
      domain: formData.domain,
      position: formData.position,
      branch: formData.branch,
      semester: formData.semester,
      email: formData.email,
      linkedin_url: formData.linkedIn,
      github_url: formData.gitHub,
      bio: formData.bio,
      photo_url: photoPreview,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('members').insert([newApplicant]);
      if (error) {
        console.warn('Supabase DB Insert notice, syncing locally:', error);
        const existing = JSON.parse(localStorage.getItem('pending_members') || '[]');
        localStorage.setItem('pending_members', JSON.stringify([newApplicant, ...existing]));
      }
    } catch {
      const existing = JSON.parse(localStorage.getItem('pending_members') || '[]');
      localStorage.setItem('pending_members', JSON.stringify([newApplicant, ...existing]));
    } finally {
      setAccentColor('#34d399');
      setSubmitted(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="w-full max-w-6xl mx-auto px-6 pt-12 pb-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-start relative z-10">
        {/* Left Column: Complete 10 Fields + Photo Upload */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
            Member Onboarding Registration
          </h1>

          {submitted ? (
            <div className="bg-slate-950/70 border border-emerald-500/40 rounded-2xl p-8 backdrop-blur-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-xl">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-slate-100">Application Submitted!</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Thank you, <span className="text-emerald-400 font-semibold">{formData.fullName || 'Candidate'}</span>. Your onboarding application has been logged and sent to the moderation queue.
              </p>
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-2 text-slate-400">
                <p><span className="text-slate-500">SRN:</span> {formData.srn || 'N/A'}</p>
                <p><span className="text-slate-500">Domain:</span> {formData.domain}</p>
                <p><span className="text-slate-500">Status:</span> <span className="text-amber-400 font-semibold">Pending Admin Approval</span></p>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setPhotoPreview(null);
                  setFormData({
                    fullName: '',
                    srn: '',
                    domain: 'Web Development',
                    position: 'Member',
                    branch: 'CSE',
                    semester: '1',
                    email: '',
                    linkedIn: '',
                    gitHub: '',
                    bio: '',
                  });
                }}
                className="inline-block text-xs font-mono text-slate-400 hover:text-indigo-400 underline pt-2"
              >
                ← Submit another application
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Photo Upload Option */}
              <div>
                <label className="text-xs font-mono text-slate-400 mb-1 block">
                  Profile Photo (Auto-converts to WebP)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  onFocus={() => setAccentColor('#c084fc')}
                  className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-purple-500 rounded-lg px-3 py-2 text-slate-300 text-xs focus:outline-none backdrop-blur-md file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>

              {/* Field 1 & 2: Full Name & SRN */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.fullName}
                    onFocus={() => setAccentColor('#818cf8')}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none backdrop-blur-md"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1 block">SRN</label>
                  <input
                    type="text"
                    required
                    placeholder="PES1UG23CS001"
                    value={formData.srn}
                    onFocus={() => setAccentColor('#818cf8')}
                    onChange={(e) => handleChange('srn', e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Field 3 & 4: Domain & Position */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1 block">Domain</label>
                  <select
                    value={formData.domain}
                    onFocus={() => setAccentColor('#38bdf8')}
                    onChange={(e) => handleChange('domain', e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-sky-500 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none backdrop-blur-md"
                  >
                    <option>Web Development</option>
                    <option>AI / Machine Learning</option>
                    <option>UI/UX Design</option>
                    <option>Cloud / DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1 block">Position</label>
                  <select
                    value={formData.position}
                    onFocus={() => setAccentColor('#38bdf8')}
                    onChange={(e) => handleChange('position', e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-sky-500 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none backdrop-blur-md"
                  >
                    <option>Member</option>
                    <option>Domain Lead</option>
                    <option>Core Coordinator</option>
                  </select>
                </div>
              </div>

              {/* Field 5 & 6: Branch & Semester */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1 block">Branch</label>
                  <select
                    value={formData.branch}
                    onFocus={() => setAccentColor('#38bdf8')}
                    onChange={(e) => handleChange('branch', e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-sky-500 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none backdrop-blur-md"
                  >
                    <option>CSE</option>
                    <option>AIML</option>
                    <option>ECE</option>
                    <option>EEE</option>
                    <option>Mech</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1 block">Semester</label>
                  <select
                    value={formData.semester}
                    onFocus={() => setAccentColor('#38bdf8')}
                    onChange={(e) => handleChange('semester', e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-sky-500 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none backdrop-blur-md"
                  >
                    <option>1</option>
                    <option>3</option>
                    <option>5</option>
                    <option>7</option>
                  </select>
                </div>
              </div>

              {/* Field 7: Email */}
              <div>
                <label className="text-xs font-mono text-slate-400 mb-1 block">Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@pes.edu"
                  value={formData.email}
                  onFocus={() => setAccentColor('#818cf8')}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none backdrop-blur-md"
                />
              </div>

              {/* Field 8 & 9: LinkedIn & GitHub */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1 block">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedIn}
                    onFocus={() => setAccentColor('#c084fc')}
                    onChange={(e) => handleChange('linkedIn', e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-purple-500 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none backdrop-blur-md"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1 block">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={formData.gitHub}
                    onFocus={() => setAccentColor('#c084fc')}
                    onChange={(e) => handleChange('gitHub', e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-purple-500 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Field 10: Short Bio */}
              <div>
                <label className="text-xs font-mono text-slate-400 mb-1 block">Short Bio (~150 chars)</label>
                <textarea
                  rows={3}
                  placeholder="Brief introduction about your tech stack and interests..."
                  value={formData.bio}
                  onFocus={() => setAccentColor('#818cf8')}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700/80 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none backdrop-blur-md resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm py-3 rounded-lg transition-all duration-300 shadow-lg"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Member Application'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Live Card Preview (Hologram or Dynamic Image Avatar) */}
        <div className="sticky top-20">
          <div className="bg-slate-950/30 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-sm text-center shadow-2xl">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4">
              Live Holographic Identity Card
            </h3>

            {/* Interactive Hologram / Photo Avatar scaling with progress */}
            <div
              className="transition-all duration-500 flex justify-center"
              style={{
                transform: `scale(${1 + completionRatio * 0.2})`,
                filter: submitted ? 'brightness(1.5)' : 'none',
              }}
            >
              {photoPreview ? (
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-sky-400 shadow-[0_0_30px_rgba(129,140,248,0.6)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Applicant Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              ) : (
                <ParticleCube />
              )}
            </div>

            <p className="mt-4 text-slate-100 font-bold text-xl">
              {formData.fullName || 'Your Full Name'}
            </p>

            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="bg-sky-900/60 border border-sky-500/40 text-sky-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full">
                {formData.domain}
              </span>
              <span className="bg-purple-900/60 border border-purple-500/40 text-purple-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full">
                {formData.position}
              </span>
            </div>

            <p className="text-slate-400 text-xs font-mono mt-2">
              {formData.srn || 'PES1UG23CS001'} • {formData.branch} (Sem {formData.semester})
            </p>

            <p className="text-slate-400 italic text-xs mt-4 px-4 line-clamp-3 leading-relaxed">
              &quot;{formData.bio || 'Your brief bio will appear right here...'}&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}