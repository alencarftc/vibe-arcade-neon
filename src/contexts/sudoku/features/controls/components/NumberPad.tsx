import { cn } from "@/shared/utils";

interface NumberPadProps {
  onNumber: (n: number) => void;
  remainingCounts: Record<number, number>;
}

export function NumberPad({ onNumber, remainingCounts }: NumberPadProps) {
  return (
    <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const remaining = remainingCounts[n] ?? 0;
        const exhausted = remaining <= 0;

        return (
          <button
            key={n}
            type="button"
            onClick={() => onNumber(n)}
            disabled={exhausted}
            className={cn(
              "flex flex-col items-center justify-center",
              "aspect-square rounded-lg text-xl sm:text-2xl",
              "transition-all duration-200 cursor-pointer select-none",
              "border border-neon-blue/30 bg-surface-light",
              !exhausted &&
                "text-white/80 hover:border-neon-blue hover:shadow-[0_0_12px_var(--color-neon-blue)] hover:text-neon-blue active:scale-95",
              "focus:outline-none",
              exhausted && "opacity-20 cursor-not-allowed",
            )}
          >
            <span>{n}</span>
            {remaining > 0 && (
              <span className="text-[10px] text-white/30 -mt-1">
                {remaining}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
