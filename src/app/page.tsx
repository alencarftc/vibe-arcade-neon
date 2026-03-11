import Link from "next/link";

const games = [
  {
    href: "/sudoku",
    title: "Sudoku",
    description:
      "Preencha a grade 9×9 com números de 1 a 9 sem repetir em linhas, colunas ou blocos.",
    icon: "⊞",
    accentColor: "#00f0ff",
  },
  {
    href: "/xadrez",
    title: "Xadrez",
    description:
      "Enfrente uma IA com diferentes níveis de dificuldade em um tabuleiro cheio de neon.",
    icon: "♟",
    accentColor: "#b829dd",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-14 px-4 py-16">
      <header className="text-center space-y-5 select-none">
        <div className="flex items-center justify-center gap-4">
          <span className="block h-px w-16 bg-gradient-to-r from-transparent to-[#00f0ff]/40" />
          <span className="font-display text-[9px] tracking-[0.6em] uppercase text-[#00f0ff]/55">
            Est. 2025
          </span>
          <span className="block h-px w-16 bg-gradient-to-l from-transparent to-[#00f0ff]/40" />
        </div>

        <div className="leading-none">
          <p
            className="font-display font-black tracking-[0.18em] uppercase text-6xl sm:text-7xl"
            style={{
              color: "#c8f0f8",
              textShadow: "0 0 6px #00f0ff, 0 0 18px #00f0ff50",
            }}
          >
            ARCADE
          </p>
          <p
            className="font-display font-black tracking-[0.22em] uppercase text-7xl sm:text-8xl"
            style={{
              color: "#d8b0ee",
              textShadow: "0 0 6px #b829dd, 0 0 18px #b829dd50",
            }}
          >
            NEON
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <span className="text-[#ffe600]/50 text-xs">◆</span>
          <span className="font-display text-[9px] tracking-[0.5em] uppercase text-white/55">
            Escolha seu jogo
          </span>
          <span className="text-[#ffe600]/50 text-xs">◆</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {games.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface-light p-8 transition-all duration-300 hover:border-[#00f0ff]/40 hover:shadow-[0_0_24px_rgba(0,240,255,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff]"
          >
            <span className="text-5xl select-none transition-transform duration-300 group-hover:scale-110">
              {game.icon}
            </span>

            <div className="space-y-1.5">
              <h2 className="text-xl font-display font-bold tracking-wider text-white group-hover:text-[#00f0ff] transition-colors duration-200">
                {game.title}
              </h2>
              <p className="text-sm text-white/60 leading-relaxed">
                {game.description}
              </p>
            </div>

            <span className="mt-auto text-xs font-display uppercase tracking-widest text-white/45 group-hover:text-[#00f0ff]/70 transition-colors duration-200">
              Jogar →
            </span>

            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#00f0ff]/4 to-transparent" />
          </Link>
        ))}
      </div>
    </main>
  );
}
