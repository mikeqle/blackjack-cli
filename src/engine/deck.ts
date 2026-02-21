import { RANKS, SUITS, type Card } from "./cards";

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export class Shoe {
  private cards: Card[] = [];

  constructor(
    private readonly decks = 1,
    private readonly reshuffleThreshold = 15
  ) {
    this.reset();
  }

  reset(): void {
    const fresh: Card[] = [];
    for (let i = 0; i < this.decks; i += 1) {
      fresh.push(...createDeck());
    }
    this.cards = shuffle(fresh);
  }

  draw(): Card {
    if (this.cards.length <= this.reshuffleThreshold) {
      this.reset();
    }

    const card = this.cards.pop();
    if (!card) {
      this.reset();
      return this.draw();
    }
    return card;
  }

  remaining(): number {
    return this.cards.length;
  }
}
