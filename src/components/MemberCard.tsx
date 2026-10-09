import ParticleCube from './ParticleCube';
interface MemberCardProps {
  name: string;
  domain: string;
  position: string;
  srn: string;
  branch: string;
  semester: string | number;
  bio: string;
  photoUrl: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export default function MemberCard({
  name,
  domain,
  position,
  srn,
  branch,
  semester,
  bio,
  photoUrl,
  linkedinUrl,
  githubUrl,
}: MemberCardProps) {
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'embrione')}`;

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
      
      <div className="flex flex-col items-center text-center">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-blue-500/30 p-1 mb-4 shadow-inner">
          {photoUrl ? (
  <img
    src={photoUrl}
    alt={name}
    className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/30 mx-auto"
  />
) : (
  <ParticleCube />
)}
        </div>

        <h3 className="text-xl font-bold text-white line-clamp-1">{name || 'Your Full Name'}</h3>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {domain || 'Domain'}
          </span>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {position || 'Position'}
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-2 font-mono">
          {srn || 'PES1UG23CS001'} • {branch || 'CSE'} (Sem {semester || '1'})
        </p>

        <p className="text-sm text-slate-300 mt-4 line-clamp-3 min-h-[3rem] italic">
          "{bio || 'Your brief bio will appear right here...'}"
        </p>

        {(linkedinUrl || githubUrl) && (
          <div className="flex gap-4 mt-6 pt-4 border-t border-slate-800/80 w-full justify-center text-xs">
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                LinkedIn
              </a>
            )}
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:underline">
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}