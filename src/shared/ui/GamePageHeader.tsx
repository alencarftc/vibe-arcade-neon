import Link from "next/link";

interface Props {
  title: string;
  accentColor?: string;
}

export function GamePageHeader({ title, accentColor = "#00f0ff" }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a1a]/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-5 py-3 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-1.5 group">
          <span className="text-white/50 group-hover:text-[#00f0ff] transition-colors leading-none">
            ←
          </span>
          <span className="font-display text-[10px] tracking-[0.4em] uppercase text-white/50 group-hover:text-[#00f0ff] transition-colors">
            Arcade Neon
          </span>
        </Link>
        <span
          className="font-display text-[10px] tracking-[0.4em] uppercase"
          style={{ color: accentColor, textShadow: `0 0 8px ${accentColor}70` }}
        >
          {title}
        </span>
      </div>
    </header>
  );
}
