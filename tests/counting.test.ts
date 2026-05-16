import { describe, expect, test } from "bun:test";
import type { Card } from "../src/engine/cards";
import { HiLoCounter, hiLoValue } from "../src/engine/counting";

const card = (rank: Card["rank"], suit: Card["suit"] = "spades"): Card => ({ rank, suit });

describe("hiLoValue", () => {
  test("returns +1 for low cards 2-6", () => {
    expect(hiLoValue("2")).toBe(1);
    expect(hiLoValue("6")).toBe(1);
  });

  test("returns 0 for neutral cards 7-9", () => {
    expect(hiLoValue("7")).toBe(0);
    expect(hiLoValue("8")).toBe(0);
    expect(hiLoValue("9")).toBe(0);
  });

  test("returns -1 for high cards including aces and tens", () => {
    expect(hiLoValue("10")).toBe(-1);
    expect(hiLoValue("J")).toBe(-1);
    expect(hiLoValue("Q")).toBe(-1);
    expect(hiLoValue("K")).toBe(-1);
    expect(hiLoValue("A")).toBe(-1);
  });
});

describe("HiLoCounter", () => {
  test("running count moves with cards observed", () => {
    const counter = new HiLoCounter(52);
    counter.observe(card("2"));
    counter.observe(card("3"));
    counter.observe(card("K"));
    expect(counter.snapshot().running).toBe(1);
    expect(counter.snapshot().cardsSeen).toBe(3);
  });

  test("true count divides by decks remaining", () => {
    const counter = new HiLoCounter(104);
    for (let i = 0; i < 26; i += 1) {
      counter.observe(card("5"));
    }
    const snap = counter.snapshot();
    expect(snap.running).toBe(26);
    expect(snap.decksRemaining).toBe(1.5);
    expect(snap.trueCount).toBeCloseTo(17.3, 1);
  });

  test("reset clears running count and seen", () => {
    const counter = new HiLoCounter(52);
    counter.observe(card("2"));
    counter.observe(card("K"));
    counter.reset();
    const snap = counter.snapshot();
    expect(snap.running).toBe(0);
    expect(snap.cardsSeen).toBe(0);
  });
});
