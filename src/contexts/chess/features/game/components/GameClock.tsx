"use client";

import { cn } from "@/shared/utils";
import { formatTime } from "../hooks/useClock";
import type { Clock } from "../model";

interface Props {
  clock: Clock;
}

export function GameClock({ clock }: Props) {
  return (
    <div className="flex gap-3">
      {(["white", "black"] as const).map((color) => {
        const isActive = clock.active === color;
        const time = clock[color];
        const isCritical = time < 30_000;

        return (
          <div
            key={color}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 rounded-xl border px-3 py-2 transition-all duration-300",
              isActive
                ? "border-[#00f0ff]/50 shadow-[0_0_12px_rgba(0,240,255,0.15)] bg-[#141428]"
                : "border-white/10 bg-[#0e0e22]",
            )}
          >
            <span className="text-[10px] font-display tracking-widest uppercase text-white/55">
              {color === "white" ? "Brancas (você)" : "Pretas (IA)"}
            </span>
            <span
              className={cn(
                "text-2xl font-display font-bold tabular-nums",
                isCritical && isActive
                  ? "text-[#ff2d95] animate-pulse"
                  : isActive
                    ? "text-[#00f0ff]"
                    : "text-white/55",
              )}
            >
              {formatTime(time)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
