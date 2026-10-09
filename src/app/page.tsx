import ChapterSection from "@/components/motion/ChapterSection";
import SplitHeadline from "@/components/motion/SplitHeadline";
import InstallPill from "@/components/ui/InstallPill";
import LearnMoreButton from "@/components/ui/LearnMoreButton";
import PersistentHeroObject from "@/components/motion/PersistentHeroObject";
import CodeCard from "@/components/motion/CodeCard";
import SectionCard from "@/components/motion/SectionCard";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full">
      {/* Chapter 1: Intro */}
      <ChapterSection chapterId="intro" label="Intro" spacersCount={2}>
        <div className="flex-1 text-left space-y-6">
          <SplitHeadline
            text="Onboard developers into digital experiences"
            accentWord="experiences"
            className="text-4xl md:text-6xl text-slate-100"
          />
          <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
            The Embrione is a high-end recruitment visualizer built with Next.js, Three.js, and scroll-driven motion architecture.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <InstallPill command="npm run dev" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <PersistentHeroObject />
          <div className="mt-8">
            <LearnMoreButton targetId="register-section" />
          </div>
        </div>
      </ChapterSection>

      {/* Chapter 2: Onboarding Flow */}
      <div id="register-section">
        <ChapterSection chapterId="register" label="Onboarding" colorClass="color-purple" spacersCount={2}>
          <div className="flex-1 text-left space-y-4">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">Chapter 01</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-100">Live Member Onboarding</h2>
            <p className="text-slate-400 text-sm md:text-base max-w-md">
              Register candidates with real-time Supabase sync, custom glassmorphic styling, and interactive 3D particle cards.
            </p>
            <Link
              href="/register"
              className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors"
            >
              Open Registration Form →
            </Link>
          </div>

          <div className="flex-1 flex justify-center">
            <CodeCard
              chapterId="register"
              filename="register/page.tsx"
              code={`const { data, error } = await supabase\n  .from('members')\n  .insert([formData]);`}
            />
          </div>
        </ChapterSection>
      </div>

      {/* Chapter 3: Team Directory */}
      <ChapterSection chapterId="directory" label="Team" colorClass="color-sky" spacersCount={2}>
        <div className="flex-1 text-left space-y-4">
          <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">Chapter 02</span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-100">Team Directory</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-md">
            Explore active applicant profiles rendered with 3D CAD mesh avatars and domain breakdown tags.
          </p>
          <Link
            href="/team"
            className="inline-block bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors"
          >
            View Directory →
          </Link>
        </div>

        <div className="flex-1 flex justify-center">
          <SectionCard
            title="Domain Allocation"
            segments={[
              { label: "Web Dev", percentage: 45, color: "#38bdf8" },
              { label: "AI / ML", percentage: 35, color: "#a855f7" },
              { label: "Design", percentage: 20, color: "#34d399" },
            ]}
          />
        </div>
      </ChapterSection>
    </div>
  );
}