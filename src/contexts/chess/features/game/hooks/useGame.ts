"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import type { PieceType } from "../model";
import {
  executeMove,
  getCurrentTurn,
  getGameStatus,
  isPlayerPiece,
  legalMovesFrom,
  needsPromotion,
  undoMove,
} from "../service";
import {
  aiThinkingAtom,
  boardRevisionAtom,
  clockAtom,
  gameInstanceAtom,
  gameStatusAtom,
  legalMovesAtom,
  moveHistoryAtom,
  pendingPromotionAtom,
  selectedSquareAtom,
} from "../store";

export function useGame() {
  const chess = useAtomValue(gameInstanceAtom);
  const [revision, setRevision] = useAtom(boardRevisionAtom);
  const [selectedSquare, setSelectedSquare] = useAtom(selectedSquareAtom);
  const [legalMoves, setLegalMoves] = useAtom(legalMovesAtom);
  const [moveHistory, setMoveHistory] = useAtom(moveHistoryAtom);
  const [status, setStatus] = useAtom(gameStatusAtom);
  const [pendingPromotion, setPendingPromotion] = useAtom(pendingPromotionAtom);
  const setClock = useSetAtom(clockAtom);
  const setAiThinking = useSetAtom(aiThinkingAtom);

  const bumpRevision = useCallback(
    () => setRevision((v) => v + 1),
    [setRevision],
  );

  const syncStatus = useCallback(() => {
    const newStatus = getGameStatus(chess);
    setStatus(newStatus);
    if (
      newStatus === "checkmate" ||
      newStatus === "draw" ||
      newStatus === "stalemate"
    ) {
      setClock((c) => ({ ...c, active: null }));
    }
  }, [chess, setStatus, setClock]);

  const selectSquare = useCallback(
    (square: string) => {
      if (pendingPromotion) return;

      const currentStatus = getGameStatus(chess);
      if (
        currentStatus === "checkmate" ||
        currentStatus === "draw" ||
        currentStatus === "stalemate"
      )
        return;

      const currentTurn = getCurrentTurn(chess);
      if (currentTurn !== "white") return;

      if (!selectedSquare) {
        if (isPlayerPiece(chess, square)) {
          setSelectedSquare(square);
          setLegalMoves(legalMovesFrom(chess, square));
        }
        return;
      }

      if (legalMoves.includes(square)) {
        if (needsPromotion(chess, selectedSquare, square)) {
          setPendingPromotion({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }

        const result = executeMove(chess, selectedSquare, square);
        if (result.ok) {
          setMoveHistory((h) => [...h, result.move]);
          syncStatus();
          setClock((c) => ({ ...c, active: "black" }));
          setAiThinking(true);
          bumpRevision();
        }
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      if (isPlayerPiece(chess, square)) {
        setSelectedSquare(square);
        setLegalMoves(legalMovesFrom(chess, square));
        return;
      }

      setSelectedSquare(null);
      setLegalMoves([]);
    },
    [
      chess,
      selectedSquare,
      legalMoves,
      pendingPromotion,
      setSelectedSquare,
      setLegalMoves,
      setMoveHistory,
      setPendingPromotion,
      setAiThinking,
      setClock,
      syncStatus,
      bumpRevision,
    ],
  );

  const confirmPromotion = useCallback(
    (piece: PieceType) => {
      if (!pendingPromotion) return;
      const result = executeMove(
        chess,
        pendingPromotion.from,
        pendingPromotion.to,
        piece,
      );
      if (result.ok) {
        setMoveHistory((h) => [...h, result.move]);
        syncStatus();
        setClock((c) => ({ ...c, active: "black" }));
        setAiThinking(true);
        bumpRevision();
      }
      setPendingPromotion(null);
    },
    [
      chess,
      pendingPromotion,
      setMoveHistory,
      setPendingPromotion,
      setAiThinking,
      setClock,
      syncStatus,
      bumpRevision,
    ],
  );

  const applyAiMove = useCallback(
    (uciMove: string) => {
      const from = uciMove.slice(0, 2);
      const to = uciMove.slice(2, 4);
      const promotion =
        uciMove.length === 5 ? (uciMove[4] as PieceType) : undefined;
      const result = executeMove(chess, from, to, promotion);
      if (result.ok) {
        setMoveHistory((h) => [...h, result.move]);
        syncStatus();
        setClock((c) => ({ ...c, active: "white" }));
      }
      setAiThinking(false);
      bumpRevision();
    },
    [chess, setMoveHistory, setAiThinking, setClock, syncStatus, bumpRevision],
  );

  const undoLastMove = useCallback(() => {
    undoMove(chess);
    undoMove(chess);
    setMoveHistory((h) => h.slice(0, -2));
    setStatus(getGameStatus(chess));
    setClock((c) => ({ ...c, active: "white" }));
    setSelectedSquare(null);
    setLegalMoves([]);
    setAiThinking(false);
    bumpRevision();
  }, [
    chess,
    setMoveHistory,
    setStatus,
    setClock,
    setSelectedSquare,
    setLegalMoves,
    setAiThinking,
    bumpRevision,
  ]);

  return {
    chess,
    revision,
    selectedSquare,
    legalMoves,
    moveHistory,
    status,
    pendingPromotion,
    selectSquare,
    confirmPromotion,
    applyAiMove,
    undoLastMove,
  };
}
