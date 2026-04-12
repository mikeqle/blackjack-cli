import { describe, expect, test } from "bun:test";
import type { Card } from "../src/engine/cards";
import { BlackjackGame } from "../src/engine/game";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });

function setDrawOrder(game: BlackjackGame, drawOrder: Card[]): void {
  const shoe = (game as unknown as { shoe: { cards: Card[]; reshuffleThreshold: number } }).shoe;
  shoe.reshuffleThreshold = 0;
  shoe.cards = drawOrder.slice().reverse();
}

describe("BlackjackGame double down", () => {
  test("doubles bet, draws exactly one card, and auto-stands", () => {
    const game = new BlackjackGame({ bankroll: 100, minBet: 10, decks: 1 });
    setDrawOrder(game, [
      card("10", "spades"),
      card("7", "hearts"),
      card("5", "clubs"),
      card("6", "diamonds"),
      card("9", "spades")
    ]);

    expect(game.startRound()).toBe(true);
    expect(game.canDoubleDown()).toBe(true);

    game.doubleDown();
    const snapshot = game.snapshot();
    const hand = snapshot.playerHands[0];

    expect(snapshot.bankroll).toBe(80);
    expect(hand.bet).toBe(20);
    expect(hand.doubled).toBe(true);
    expect(hand.cards.length).toBe(3);
    expect(snapshot.phase).toBe("dealer_turn");
  });

  test("rejects double down when bankroll cannot match hand bet", () => {
    const game = new BlackjackGame({ bankroll: 15, minBet: 10, decks: 1 });
    setDrawOrder(game, [
      card("10", "spades"),
      card("7", "hearts"),
      card("5", "clubs"),
      card("6", "diamonds")
    ]);

    expect(game.startRound()).toBe(true);
    expect(game.canDoubleDown()).toBe(false);

    game.doubleDown();
    const snapshot = game.snapshot();
    const hand = snapshot.playerHands[0];

    expect(snapshot.phase).toBe("player_turn");
    expect(snapshot.bankroll).toBe(5);
    expect(hand.bet).toBe(10);
    expect(hand.cards.length).toBe(2);
    expect(snapshot.message).toContain("Cannot double down");
    expect(snapshot.message).toContain("Need $10");
  });

  test("rejects double down after a hit on the same hand", () => {
    const game = new BlackjackGame({ bankroll: 100, minBet: 10, decks: 1 });
    setDrawOrder(game, [
      card("10", "spades"),
      card("7", "hearts"),
      card("5", "clubs"),
      card("6", "diamonds"),
      card("2", "hearts")
    ]);

    expect(game.startRound()).toBe(true);
    game.hit();
    game.doubleDown();
    const snapshot = game.snapshot();
    const hand = snapshot.playerHands[0];

    expect(snapshot.phase).toBe("player_turn");
    expect(hand.bet).toBe(10);
    expect(hand.cards.length).toBe(3);
    expect(snapshot.message).toContain("first decision");
  });

  test("marks hand as immediate loss when double-down card busts", () => {
    const game = new BlackjackGame({ bankroll: 100, minBet: 10, decks: 1 });
    setDrawOrder(game, [
      card("10", "spades"),
      card("7", "hearts"),
      card("10", "clubs"),
      card("6", "diamonds"),
      card("8", "hearts")
    ]);

    expect(game.startRound()).toBe(true);
    game.doubleDown();
    const snapshot = game.snapshot();
    const hand = snapshot.playerHands[0];

    expect(hand.outcome).toBe("lose");
    expect(snapshot.bankroll).toBe(80);
    expect(snapshot.phase).toBe("round_over");
  });

  test("applies double-down rules independently to split hands", () => {
    const game = new BlackjackGame({ bankroll: 100, minBet: 10, decks: 1 });
    setDrawOrder(game, [
      card("10", "spades"),
      card("6", "hearts"),
      card("8", "clubs"),
      card("8", "diamonds"),
      card("3", "hearts"),
      card("2", "spades"),
      card("K", "clubs"),
      card("9", "diamonds")
    ]);

    expect(game.startRound()).toBe(true);
    game.split();

    let snapshot = game.snapshot();
    expect(snapshot.bankroll).toBe(80);
    expect(snapshot.playerHands.length).toBe(2);
    expect(snapshot.activeHandIndex).toBe(0);
    expect(snapshot.playerHands[0].cards.length).toBe(2);
    expect(snapshot.playerHands[1].cards.length).toBe(2);
    expect(game.canDoubleDown()).toBe(true);

    game.doubleDown();
    snapshot = game.snapshot();
    expect(snapshot.bankroll).toBe(70);
    expect(snapshot.activeHandIndex).toBe(1);
    expect(snapshot.playerHands[0].bet).toBe(20);
    expect(snapshot.playerHands[0].doubled).toBe(true);
    expect(snapshot.playerHands[0].cards.length).toBe(3);
    expect(game.canDoubleDown()).toBe(true);

    game.doubleDown();
    snapshot = game.snapshot();
    expect(snapshot.bankroll).toBe(60);
    expect(snapshot.playerHands[1].bet).toBe(20);
    expect(snapshot.playerHands[1].doubled).toBe(true);
    expect(snapshot.playerHands[1].cards.length).toBe(3);
    expect(snapshot.phase).toBe("dealer_turn");
  });
});

describe("BlackjackGame bankroll gating", () => {
  test("starts in game over when bankroll is below minimum bet", () => {
    const game = new BlackjackGame({ bankroll: 5, minBet: 10, decks: 1 });
    const snapshot = game.snapshot();

    expect(snapshot.phase).toBe("game_over");
    expect(snapshot.message).toContain("Come back tomorrow");
  });
});
