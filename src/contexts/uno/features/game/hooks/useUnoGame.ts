"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import type { CardColor } from "../model";
import { initGame, drawAndPass, playCard, runAiTurn } from "../service";
import { gameStateAtom, pendingWildCardIdAtom } from "../store";

export function useUnoGame() {
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const [pendingWildCardId, setPendingWildCardId] = useAtom(pendingWildCardIdAtom);

  const startGame = useCallback(() => {
    setGameState(initGame());
    setPendingWildCardId(null);
  }, [setGameState, setPendingWildCardId]);

  const handlePlayCard = useCallback(
    (cardId: string) => {
      if (!gameState) return;
      const hand = gameState.hands.human;
      const card = hand.find((c) => c.id === cardId);
      if (!card) return;
      if (card.value === "wild" || card.value === "wild_draw_four") {
        setPendingWildCardId(cardId);
        return;
      }
      setGameState(playCard(gameState, cardId));
    },
    [gameState, setGameState, setPendingWildCardId],
  );

  const handleChooseWildColor = useCallback(
    (color: CardColor) => {
      if (!gameState || !pendingWildCardId) return;
      setGameState(playCard(gameState, pendingWildCardId, color));
      setPendingWildCardId(null);
    },
    [gameState, pendingWildCardId, setGameState, setPendingWildCardId],
  );

  const handleDrawCard = useCallback(() => {
    if (!gameState) return;
    setGameState(drawAndPass(gameState));
  }, [gameState, setGameState]);

  const cancelWild = useCallback(() => {
    setPendingWildCardId(null);
  }, [setPendingWildCardId]);

  useEffect(() => {
    if (!gameState || gameState.phase !== "playing" || gameState.currentPlayer !== "ai") return;
    const timer = setTimeout(() => {
      setGameState(runAiTurn(gameState));
    }, 700);
    return () => clearTimeout(timer);
  }, [gameState, setGameState]);

  return {
    gameState,
    pendingWildCardId,
    startGame,
    playCard: handlePlayCard,
    chooseWildColor: handleChooseWildColor,
    drawCard: handleDrawCard,
    cancelWild,
  };
}
