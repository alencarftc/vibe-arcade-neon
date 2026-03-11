import type { CardColor } from "../model";

const COLORS: { color: CardColor; label: string; bg: string; border: string }[] = [
  { color: "red", label: "Vermelho", bg: "bg-[#cc1c1c]", border: "border-[#ff4444]" },
  { color: "blue", label: "Azul", bg: "bg-[#1a4ecc]", border: "border-[#4488ff]" },
  { color: "green", label: "Verde", bg: "bg-[#1a8c36]", border: "border-[#22cc55]" },
  { color: "yellow", label: "Amarelo", bg: "bg-[#c8a800]", border: "border-[#ffe600]" },
];

interface Props {
  onChoose: (color: CardColor) => void;
  onCancel: () => void;
}

export function ColorPicker({ onChoose, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#b829dd]/40 bg-[#0a0a1a] p-8 shadow-[0_0_40px_rgba(184,41,221,0.2)]">
        <h2 className="font-display text-sm font-bold tracking-widest uppercase text-[#b829dd]">
          Escolha a cor
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {COLORS.map(({ color, label, bg, border }) => (
            <button
              key={color}
              type="button"
              onClick={() => onChoose(color)}
              className={`w-28 h-16 rounded-xl border-2 ${bg} ${border} font-display text-sm font-bold text-white tracking-wider transition-all hover:scale-105 active:scale-95`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="font-display text-xs tracking-widest text-white/30 hover:text-white/60 transition-colors uppercase"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
