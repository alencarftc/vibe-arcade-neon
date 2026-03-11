import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Arcade Neon",
  description: "Site de jogos com estilo neon — Sudoku, Xadrez e mais.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={orbitron.variable}>
      <body className="bg-surface text-white antialiased font-display">
        {children}
      </body>
    </html>
  );
}
