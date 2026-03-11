"use client";

import { useCallback, useEffect, useRef } from "react";
import type { DifficultyLevel } from "../model";
import { SKILL_LEVEL } from "../model";

const MOVETIME_BY_DIFFICULTY: Record<DifficultyLevel, number> = {
  easy: 500,
  medium: 1000,
  hard: 2000,
  master: 3000,
};

type MoveCallback = (uciMove: string) => void;

function sendCommand(worker: Worker, command: string) {
  worker.postMessage(command);
}

export function useStockfish(
  difficulty: DifficultyLevel | null,
  onMove: MoveCallback,
) {
  const workerRef = useRef<Worker | null>(null);
  const onMoveRef = useRef<MoveCallback>(onMove);
  const difficultyRef = useRef<DifficultyLevel | null>(difficulty);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const worker = new Worker("/stockfish.js");
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent) => {
      const line: string =
        typeof event.data === "string" ? event.data : String(event.data);
      if (line.startsWith("bestmove")) {
        const parts = line.split(" ");
        const move = parts[1];
        if (move && move !== "(none)") {
          onMoveRef.current(move);
        }
      }
    };

    sendCommand(worker, "uci");
    sendCommand(worker, "isready");

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const requestMove = useCallback((fen: string) => {
    const worker = workerRef.current;
    if (!worker || difficultyRef.current === null) return;

    const skill = SKILL_LEVEL[difficultyRef.current];
    const movetime = MOVETIME_BY_DIFFICULTY[difficultyRef.current];
    sendCommand(worker, `setoption name Skill Level value ${skill}`);
    sendCommand(worker, `position fen ${fen}`);
    sendCommand(worker, `go movetime ${movetime}`);
  }, []);

  return { requestMove };
}
