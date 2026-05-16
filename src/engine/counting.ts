import type { Card, Rank } from "./cards";

export function hiLoValue(rank: Rank): -1 | 0 | 1 {
  if (rank === "2" || rank === "3" || rank === "4" || rank === "5" || rank === "6") return 1;
  if (rank === "7" || rank === "8" || rank === "9") return 0;
  return -1;
}

export interface CountSnapshot {
  running: number;
  trueCount: number;
  cardsSeen: number;
  decksRemaining: number;
}

export class HiLoCounter {
  private running = 0;
  private cardsSeen = 0;

  constructor(private readonly totalCards: number) {}

  observe(card: Card): void {
    this.running += hiLoValue(card.rank);
    this.cardsSeen += 1;
  }

  reset(): void {
    this.running = 0;
    this.cardsSeen = 0;
  }

  snapshot(): CountSnapshot {
    const cardsRemaining = Math.max(1, this.totalCards - this.cardsSeen);
    const decksRemaining = Math.max(0.5, cardsRemaining / 52);
    const trueCount = this.running / decksRemaining;
    return {
      running: this.running,
      trueCount: Math.round(trueCount * 10) / 10,
      cardsSeen: this.cardsSeen,
      decksRemaining: Math.round(decksRemaining * 10) / 10
    };
  }
}
