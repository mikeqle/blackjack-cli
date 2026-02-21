import { describe, expect, test } from "bun:test";
import type { Card } from "../src/engine/cards";
import { isBlackjack, scoreHand } from "../src/engine/hand";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({ rank, suit });

describe("scoreHand", () => {
  test("counts a single ace as soft 11 when possible", () => {
    const result = scoreHand([card("A", "spades"), card("6", "hearts")]);
    expect(result.total).toBe(17);
    expect(result.soft).toBe(true);
  });

  test("converts ace to 1 when total would bust", () => {
    const result = scoreHand([card("A", "spades"), card("9", "hearts"), card("7", "clubs")]);
    expect(result.total).toBe(17);
    expect(result.soft).toBe(false);
  });

  test("handles multiple aces correctly", () => {
    const result = scoreHand([card("A", "spades"), card("A", "hearts"), card("9", "clubs")]);
    expect(result.total).toBe(21);
    expect(result.soft).toBe(true);
  });
});

describe("isBlackjack", () => {
  test("returns true for natural blackjack", () => {
    expect(isBlackjack([card("A", "spades"), card("K", "hearts")])).toBe(true);
  });

  test("returns false for 21 with more than two cards", () => {
    expect(isBlackjack([card("A", "spades"), card("5", "hearts"), card("5", "clubs")])).toBe(false);
  });
});
