'use client';

interface BarSegment {
  label: string;
  percentage: number;
  color: string;
}

export default function SectionCard({
  title,
  segments,
}: {
  title: string;
  segments: BarSegment[];
}) {
  return (
    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-xl">
      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">{title}</h4>
      
      {/* Stacked Percentage Bar */}
      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex mb-4 border border-slate-800">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="h-full transition-all duration-500"
            style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
            title={`${seg.label}: ${seg.percentage}%`}
          />
        ))}
      </div>

      {/* Segment Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-slate-300">{seg.label}</span>
            <span className="text-slate-500 text-[10px] ml-auto">{seg.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}