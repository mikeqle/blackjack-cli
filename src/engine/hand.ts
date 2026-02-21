import { cardValue, type Card } from "./cards";

export interface HandScore {
  total: number;
  soft: boolean;
}

export function scoreHand(cards: Card[]): HandScore {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    total += cardValue(card.rank);
    if (card.rank === "A") {
      aces += 1;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return {
    total,
    soft: aces > 0
  };
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && scoreHand(cards).total === 21;
}

export function isBust(cards: Card[]): boolean {
  return scoreHand(cards).total > 21;
}

export function canSplit(cards: Card[]): boolean {
  return cards.length === 2 && cardValue(cards[0].rank) === cardValue(cards[1].rank);
}
