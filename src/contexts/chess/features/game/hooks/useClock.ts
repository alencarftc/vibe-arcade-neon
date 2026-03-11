"use client";

import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import type { Clock } from "../model";
import { clockAtom } from "../store";

const TICK_MS = 100;

export function useClock() {
  const [clock, setClock] = useAtom(clockAtom);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (clock.active === null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setClock((c: Clock) => {
        if (!c.active) return c;
        const field = c.active === "white" ? "white" : "black";
        const newTime = Math.max(0, c[field] - TICK_MS);
        return { ...c, [field]: newTime };
      });
    }, TICK_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [clock.active, setClock]);

  return { clock };
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
