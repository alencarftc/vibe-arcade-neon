"use client";

import { useUnoGame } from "../hooks/useUnoGame";
import { ColorPicker } from "./ColorPicker";
import { DiscardPile } from "./DiscardPile";
import { PlayerHand } from "./PlayerHand";

const COLOR_LABEL: Record<string, string> = {
  red: "Vermelho",
  blue: "Azul",
  green: "Verde",
  yellow: "Amarelo",
  wild: "Curinga",
};

export function GameShell() {
  const {
    gameState,
    pendingWildCardId,
    startGame,
    playCard,
    chooseWildColor,
    drawCard,
    cancelWild,
  } = useUnoGame();

  if (!gameState || gameState.phase === "idle") {
    return (
      <div className="flex flex-col items-center gap-8 px-4 py-12">
        <div className="text-center space-y-3">
          <h1
            className="text-5xl sm:text-6xl font-display font-black tracking-widest uppercase"
            style={{ color: "#ff9999", textShadow: "0 0 8px #ff444488, 0 0 20px #ff444440" }}
          >
            🃏 UNO
          </h1>
          <p className="text-sm tracking-widest uppercase text-white/50 font-display">
            Você vs IA
          </p>
        </div>
        <button
          type="button"
          onClick={startGame}
          className="rounded-2xl border border-[#ff4444]/40 bg-[#141428] px-10 py-4 font-display text-lg font-bold tracking-widest text-[#ff9999] uppercase transition-all hover:border-[#ff4444]/80 hover:shadow-[0_0_20px_rgba(255,68,68,0.25)] hover:scale-105 active:scale-95"
        >
          Nova Partida
        </button>
      </div>
    );
  }

  const { phase, winner, hands, discardPile, currentPlayer, pendingDraw, currentColor } = gameState;
  const topCard = discardPile[discardPile.length - 1];
  const isHumanTurn = currentPlayer === "human";
  const isAiTurn = currentPlayer === "ai";

  if (phase === "finished") {
    return (
      <div className="flex flex-col items-center gap-8 px-4 py-12">
        <div className="text-center space-y-3">
          <p
            className="text-5xl sm:text-6xl font-display font-black"
            style={
              winner === "human"
                ? { color: "#22cc55", textShadow: "0 0 12px #22cc5588" }
                : { color: "#ff4444", textShadow: "0 0 12px #ff444488" }
            }
          >
            {winner === "human" ? "🏆 Você venceu!" : "💀 Você perdeu."}
          </p>
        </div>
        <button
          type="button"
          onClick={startGame}
          className="rounded-2xl border border-[#ff4444]/40 bg-[#141428] px-10 py-4 font-display text-lg font-bold tracking-widest text-[#ff9999] uppercase transition-all hover:border-[#ff4444]/80 hover:shadow-[0_0_20px_rgba(255,68,68,0.25)] hover:scale-105 active:scale-95"
        >
          Jogar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg mx-auto px-4 py-4 select-none">
      {/* Status bar */}
      <div className="flex items-center justify-between text-[10px] font-display tracking-widest uppercase">
        <span className={isAiTurn ? "text-[#ff9999] animate-pulse" : "text-white/30"}>
          {isAiTurn ? "IA jogando…" : "IA"}
        </span>
        <span
          className="px-3 py-1 rounded-full border text-[9px]"
          style={{
            borderColor: currentColor === "wild" ? "#b829dd" : undefined,
            color: currentColor === "wild" ? "#b829dd" : undefined,
          }}
        >
          {COLOR_LABEL[currentColor] ?? currentColor}
          {pendingDraw > 0 && (
            <span className="ml-1 text-[#ff4444] font-bold">+{pendingDraw}</span>
          )}
        </span>
        <span className={isHumanTurn ? "text-[#22cc55]" : "text-white/30"}>
          {isHumanTurn ? "Sua vez" : "Você"}
        </span>
      </div>

      {/* AI hand */}
      <div className="flex items-center justify-center py-2">
        <PlayerHand cards={hands.ai} faceDown />
        <span className="ml-2 font-display text-[10px] text-white/30 tracking-wider">
          {hands.ai.length}
        </span>
      </div>

      {/* Game area */}
      <div className="flex items-center justify-center py-4">
        <DiscardPile
          topCard={topCard}
          onDraw={drawCard}
          disabled={!isHumanTurn || isAiTurn}
          pendingDraw={isHumanTurn ? pendingDraw : 0}
        />
      </div>

      {/* Human hand */}
      <div className="flex flex-col items-center gap-2">
        <PlayerHand
          cards={hands.human}
          onPlay={playCard}
          disabled={!isHumanTurn}
        />
        <span className="font-display text-[10px] text-white/30 tracking-wider">
          {hands.human.length} carta{hands.human.length !== 1 ? "s" : ""}
        </span>
      </div>

      {pendingWildCardId && (
        <ColorPicker onChoose={chooseWildColor} onCancel={cancelWild} />
      )}
    </div>
  );
}
