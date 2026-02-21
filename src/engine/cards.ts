export const SUITS = ["clubs", "diamonds", "hearts", "spades"] as const;
export const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K"
] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const SUIT_SYMBOL: Record<Suit, string> = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠"
};

export const SUIT_COLOR: Record<Suit, "white" | "red"> = {
  clubs: "white",
  spades: "white",
  hearts: "red",
  diamonds: "red"
};

export function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (["K", "Q", "J", "10"].includes(rank)) return 10;
  return Number(rank);
}

export function formatCard(card: Card): string {
  return `${card.rank}${SUIT_SYMBOL[card.suit]}`;
}
