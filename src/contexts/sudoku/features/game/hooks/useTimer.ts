import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { elapsedAtom, gameStatusAtom } from "../store";

export function useTimer() {
  const status = useAtomValue(gameStatusAtom);
  const setElapsed = useSetAtom(elapsedAtom);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "playing") {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, setElapsed]);
}
