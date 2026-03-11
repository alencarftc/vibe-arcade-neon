"use client";

import { Chess } from "chess.js";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import { useClock } from "../hooks/useClock";
import { useGame } from "../hooks/useGame";
import { useStockfish } from "../hooks/useStockfish";
import type { DifficultyLevel, PieceType } from "../model";
import { getFEN } from "../service";
import {
  aiThinkingAtom,
  boardRevisionAtom,
  clockAtom,
  difficultyAtom,
  gameInstanceAtom,
  gameStatusAtom,
  legalMovesAtom,
  moveHistoryAtom,
  pendingPromotionAtom,
  selectedSquareAtom,
} from "../store";

import { ChessBoard } from "./ChessBoard";
import { DifficultySelector } from "./DifficultySelector";
import { GameClock } from "./GameClock";
import { MoveHistory } from "./MoveHistory";
import { PromotionModal } from "./PromotionModal";

const DEFAULT_CLOCK_MS = 10 * 60 * 1000;

export function GameShell() {
  const [difficulty, setDifficulty] = useAtom(difficultyAtom);
  const status = useAtomValue(gameStatusAtom);
  const setGameInstance = useSetAtom(gameInstanceAtom);
  const setBoardRevision = useSetAtom(boardRevisionAtom);
  const setMoveHistory = useSetAtom(moveHistoryAtom);
  const setSelectedSquare = useSetAtom(selectedSquareAtom);
  const setLegalMoves = useSetAtom(legalMovesAtom);
  const setPendingPromotion = useSetAtom(pendingPromotionAtom);
  const setStatus = useSetAtom(gameStatusAtom);
  const setClock = useSetAtom(clockAtom);
  const aiThinking = useAtomValue(aiThinkingAtom);

  const {
    chess,
    selectedSquare,
    legalMoves,
    moveHistory,
    pendingPromotion,
    selectSquare,
    confirmPromotion,
    applyAiMove,
    undoLastMove,
  } = useGame();

  const { clock } = useClock();

  const handleAiMove = useCallback(
    (uciMove: string) => {
      applyAiMove(uciMove);
    },
    [applyAiMove],
  );

  const { requestMove } = useStockfish(difficulty, handleAiMove);

  useEffect(() => {
    if (aiThinking && (status === "playing" || status === "check")) {
      requestMove(getFEN(chess));
    }
  }, [aiThinking, status, chess, requestMove]);

  const startGame = useCallback(
    (level: DifficultyLevel) => {
      const newGame = new Chess();
      setGameInstance(newGame);
      setBoardRevision(0);
      setMoveHistory([]);
      setSelectedSquare(null);
      setLegalMoves([]);
      setPendingPromotion(null);
      setStatus("playing");
      setClock({
        white: DEFAULT_CLOCK_MS,
        black: DEFAULT_CLOCK_MS,
        active: "white",
      });
      setDifficulty(level);
    },
    [
      setGameInstance,
      setBoardRevision,
      setMoveHistory,
      setSelectedSquare,
      setLegalMoves,
      setPendingPromotion,
      setStatus,
      setClock,
      setDifficulty,
    ],
  );

  if (!difficulty || status === "waiting") {
    return <DifficultySelector onSelect={startGame} />;
  }

  const isGameOver =
    status === "checkmate" ||
    status === "draw" ||
    status === "stalemate" ||
    status === "finished";

  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto px-4 py-6">
      <GameClock clock={clock} />

      {status === "check" && (
        <div className="text-center text-sm font-display tracking-widest uppercase text-[#ff7bbf] animate-pulse">
          ⚠ Xeque!
        </div>
      )}
      {isGameOver && (
        <div className="text-center text-sm font-display tracking-widest uppercase text-[#ffe87a]">
          {status === "checkmate"
            ? moveHistory[moveHistory.length - 1]?.color === "white"
              ? "🏆 Você venceu!"
              : "💀 Você perdeu."
            : "🤝 Empate"}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="relative w-full max-w-[480px] mx-auto lg:mx-0 pl-6 pb-6">
          <ChessBoard
            chess={chess}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            moveHistory={moveHistory.map((m) => ({ from: m.from, to: m.to }))}
            onSquareClick={selectSquare}
          />

          {aiThinking && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none pl-6 pb-6">
              <span className="font-display text-xs tracking-widest uppercase text-[#b829dd] animate-pulse">
                IA pensando…
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 w-full lg:w-56 shrink-0">
          <div className="rounded-xl border border-white/10 bg-[#0e0e22] p-3 h-64 flex flex-col">
            <MoveHistory moveHistory={moveHistory} />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={undoLastMove}
              disabled={moveHistory.length < 2 || isGameOver || aiThinking}
              className="w-full rounded-xl border border-white/10 bg-[#141428] px-4 py-2 text-sm font-display tracking-wider text-white/60 transition-all hover:border-[#00f0ff]/40 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ↩ Desfazer
            </button>
            <button
              type="button"
              onClick={() => {
                setDifficulty(null);
                setStatus("waiting");
              }}
              className="w-full rounded-xl border border-white/10 bg-[#141428] px-4 py-2 text-sm font-display tracking-wider text-white/60 transition-all hover:border-[#ff2d95]/40 hover:text-white/80"
            >
              ⟳ Nova partida
            </button>
          </div>
        </div>
      </div>

      {pendingPromotion && (
        <PromotionModal
          onChoose={(piece: PieceType) => confirmPromotion(piece)}
        />
      )}
    </div>
  );
}
