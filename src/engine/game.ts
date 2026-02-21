import type { Card } from "./cards";
import { Shoe } from "./deck";
import { canSplit, isBlackjack, isBust, scoreHand } from "./hand";

export type Phase = "betting" | "player_turn" | "dealer_turn" | "round_over" | "game_over";

export interface HandState {
  cards: Card[];
  bet: number;
  doubled: boolean;
  fromSplit: boolean;
  naturalBlackjack: boolean;
  outcome?: "win" | "lose" | "push" | "blackjack";
}

export interface RoundSnapshot {
  phase: Phase;
  bankroll: number;
  pendingBet: number;
  dealerCards: Card[];
  playerHands: HandState[];
  activeHandIndex: number;
  message: string;
  shoeRemaining: number;
}

export class BlackjackGame {
  readonly minBet: number;
  private readonly shoe: Shoe;
  private phase: Phase = "betting";
  private bankroll: number;
  private pendingBet: number;
  private dealerCards: Card[] = [];
  private playerHands: HandState[] = [];
  private activeHandIndex = 0;
  private message = "Set your bet to begin.";

  constructor(config?: { bankroll?: number; minBet?: number; decks?: number }) {
    this.minBet = config?.minBet ?? 10;
    this.bankroll = config?.bankroll ?? 500;
    this.pendingBet = this.minBet;
    this.shoe = new Shoe(config?.decks ?? 1);
  }

  snapshot(): RoundSnapshot {
    return {
      phase: this.phase,
      bankroll: this.bankroll,
      pendingBet: this.pendingBet,
      dealerCards: this.dealerCards,
      playerHands: this.playerHands,
      activeHandIndex: this.activeHandIndex,
      message: this.message,
      shoeRemaining: this.shoe.remaining()
    };
  }

  adjustBet(delta: number): void {
    if (this.phase !== "betting") return;
    const next = this.pendingBet + delta;
    const clamped = Math.max(this.minBet, Math.min(next, this.bankroll));
    this.pendingBet = Math.floor(clamped / this.minBet) * this.minBet || this.minBet;
  }

  startRound(): boolean {
    if (this.phase !== "betting") return false;
    if (this.bankroll < this.pendingBet) {
      this.message = "Not enough bankroll for that bet.";
      return false;
    }

    this.bankroll -= this.pendingBet;
    this.phase = "player_turn";
    this.dealerCards = [this.shoe.draw(), this.shoe.draw()];
    const cards = [this.shoe.draw(), this.shoe.draw()];
    this.playerHands = [
      {
        cards,
        bet: this.pendingBet,
        doubled: false,
        fromSplit: false,
        naturalBlackjack: isBlackjack(cards)
      }
    ];
    this.activeHandIndex = 0;

    const dealerNatural = isBlackjack(this.dealerCards);
    const playerNatural = this.playerHands[0].naturalBlackjack;

    if (dealerNatural || playerNatural) {
      this.phase = "round_over";
      this.settleRound();
      return true;
    }

    this.message = "Your move.";
    return true;
  }

  hit(): void {
    if (this.phase !== "player_turn") return;
    const hand = this.playerHands[this.activeHandIndex];
    hand.cards.push(this.shoe.draw());

    if (isBust(hand.cards)) {
      hand.outcome = "lose";
      this.advanceHand();
      this.message = `Hand ${this.activeHandIndex + 1} busted.`;
    } else {
      this.message = "Hit or stand.";
    }
  }

  stand(): void {
    if (this.phase !== "player_turn") return;
    this.message = `Hand ${this.activeHandIndex + 1} stands.`;
    this.advanceHand();
  }

  doubleDown(): void {
    if (!this.canDoubleDown()) return;
    const hand = this.playerHands[this.activeHandIndex];
    this.bankroll -= hand.bet;
    hand.bet *= 2;
    hand.doubled = true;
    hand.cards.push(this.shoe.draw());
    this.message = `Hand ${this.activeHandIndex + 1} doubled down.`;

    if (isBust(hand.cards)) {
      hand.outcome = "lose";
      this.message = `Hand ${this.activeHandIndex + 1} busted after double.`;
    }

    this.advanceHand();
  }

  split(): void {
    if (!this.canSplit()) return;
    const hand = this.playerHands[this.activeHandIndex];
    this.bankroll -= hand.bet;

    const firstCard = hand.cards[0];
    const secondCard = hand.cards[1];

    const left: HandState = {
      cards: [firstCard, this.shoe.draw()],
      bet: hand.bet,
      doubled: false,
      fromSplit: true,
      naturalBlackjack: false
    };

    const right: HandState = {
      cards: [secondCard, this.shoe.draw()],
      bet: hand.bet,
      doubled: false,
      fromSplit: true,
      naturalBlackjack: false
    };

    this.playerHands.splice(this.activeHandIndex, 1, left, right);
    this.message = "Hand split. Play the left hand first.";
  }

  playDealerToEnd(): void {
    if (this.phase !== "dealer_turn") return;
    while (scoreHand(this.dealerCards).total < 17) {
      this.dealerCards.push(this.shoe.draw());
    }
    this.settleRound();
    this.phase = this.bankroll >= this.minBet ? "round_over" : "game_over";
  }

  nextRound(): void {
    if (this.phase !== "round_over") return;
    this.dealerCards = [];
    this.playerHands = [];
    this.activeHandIndex = 0;
    if (this.bankroll < this.minBet) {
      this.phase = "game_over";
      this.message = "Out of bankroll. Press q to quit.";
      return;
    }

    this.phase = "betting";
    if (this.pendingBet > this.bankroll) {
      this.pendingBet = Math.max(this.minBet, Math.floor(this.bankroll / this.minBet) * this.minBet);
    }
    this.message = "Set your bet to begin.";
  }

  canHit(): boolean {
    return this.phase === "player_turn";
  }

  canStand(): boolean {
    return this.phase === "player_turn";
  }

  canDoubleDown(): boolean {
    if (this.phase !== "player_turn") return false;
    const hand = this.playerHands[this.activeHandIndex];
    return hand.cards.length === 2 && !hand.doubled && this.bankroll >= hand.bet;
  }

  canSplit(): boolean {
    if (this.phase !== "player_turn") return false;
    const hand = this.playerHands[this.activeHandIndex];
    return canSplit(hand.cards) && this.bankroll >= hand.bet;
  }

  shouldRevealDealer(): boolean {
    return this.phase === "dealer_turn" || this.phase === "round_over" || this.phase === "game_over";
  }

  getActiveHandTotal(): number | null {
    if (this.phase !== "player_turn") return null;
    return scoreHand(this.playerHands[this.activeHandIndex].cards).total;
  }

  private advanceHand(): void {
    const next = this.playerHands.findIndex((_, i) => i > this.activeHandIndex && !this.playerHands[i].outcome);

    if (next >= 0) {
      this.activeHandIndex = next;
      return;
    }

    const unresolved = this.playerHands.some((hand) => !hand.outcome && !isBust(hand.cards));
    if (!unresolved) {
      this.phase = "round_over";
      this.settleRound();
      return;
    }

    this.phase = "dealer_turn";
    this.message = "Dealer turn...";
  }

  private settleRound(): void {
    const dealerScore = scoreHand(this.dealerCards);
    const dealerNatural = isBlackjack(this.dealerCards);
    const dealerBust = dealerScore.total > 21;

    for (const hand of this.playerHands) {
      const playerScore = scoreHand(hand.cards);
      if (isBust(hand.cards)) {
        hand.outcome = "lose";
        continue;
      }

      if (hand.naturalBlackjack) {
        if (dealerNatural) {
          hand.outcome = "push";
          this.bankroll += hand.bet;
        } else {
          hand.outcome = "blackjack";
          this.bankroll += hand.bet * 2.5;
        }
        continue;
      }

      if (dealerNatural) {
        hand.outcome = "lose";
        continue;
      }

      if (dealerBust) {
        hand.outcome = "win";
        this.bankroll += hand.bet * 2;
        continue;
      }

      if (playerScore.total > dealerScore.total) {
        hand.outcome = "win";
        this.bankroll += hand.bet * 2;
      } else if (playerScore.total < dealerScore.total) {
        hand.outcome = "lose";
      } else {
        hand.outcome = "push";
        this.bankroll += hand.bet;
      }
    }

    const winnings = this.playerHands.filter((h) => h.outcome === "win" || h.outcome === "blackjack").length;
    const pushes = this.playerHands.filter((h) => h.outcome === "push").length;

    if (winnings > 0 && pushes > 0) {
      this.message = `Round over: ${winnings} win, ${pushes} push.`;
    } else if (winnings > 0) {
      this.message = `Round over: ${winnings} winning hand${winnings > 1 ? "s" : ""}.`;
    } else if (pushes > 0) {
      this.message = `Round over: ${pushes} push.`;
    } else {
      this.message = "Round over: dealer wins.";
    }
  }
}
