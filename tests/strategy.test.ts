import { describe, expect, test } from "bun:test";
import type { Card } from "../src/engine/cards";
import { bettingAdvice, recommend } from "../src/engine/strategy";

const card = (rank: Card["rank"], suit: Card["suit"] = "spades"): Card => ({ rank, suit });

describe("recommend basic strategy", () => {
  test("hits hard 15 vs dealer 10", () => {
    const result = recommend([card("9"), card("6")], card("10", "hearts"), false, true, 0);
    expect(result.action).toBe("hit");
    expect(result.deviationApplied).toBe(false);
  });

  test("stands hard 17 vs anything", () => {
    const result = recommend([card("10"), card("7")], card("A", "hearts"), false, false, 0);
    expect(result.action).toBe("stand");
  });

  test("doubles hard 11 vs 6 when allowed", () => {
    const result = recommend([card("6"), card("5")], card("6", "hearts"), false, true, 0);
    expect(result.action).toBe("double");
  });

  test("splits aces", () => {
    const result = recommend([card("A"), card("A", "hearts")], card("9", "hearts"), true, true, 0);
    expect(result.action).toBe("split");
  });

  test("never splits tens", () => {
    const result = recommend([card("10"), card("K")], card("6", "hearts"), true, true, 0);
    expect(result.action).toBe("stand");
  });

  test("splits eights even against a 10", () => {
    const result = recommend([card("8"), card("8", "hearts")], card("10", "hearts"), true, true, 0);
    expect(result.action).toBe("split");
  });

  test("soft 18 hits vs dealer 9", () => {
    const result = recommend([card("A"), card("7")], card("9", "hearts"), false, true, 0);
    expect(result.action).toBe("hit");
  });

  test("downgrades double to hit when doubling not allowed (hard 11)", () => {
    const result = recommend([card("6"), card("3"), card("2")], card("6", "hearts"), false, false, 0);
    expect(result.action).toBe("hit");
  });
});

describe("Illustrious 18 deviations", () => {
  test("16 vs 10 stands when true count >= 0", () => {
    const result = recommend([card("10"), card("6")], card("10", "hearts"), false, false, 0);
    expect(result.action).toBe("stand");
    expect(result.deviationApplied).toBe(true);
  });

  test("16 vs 10 hits when true count < 0", () => {
    const result = recommend([card("10"), card("6")], card("10", "hearts"), false, false, -1);
    expect(result.action).toBe("hit");
    expect(result.deviationApplied).toBe(false);
  });

  test("15 vs 10 stands at TC >= 4", () => {
    const result = recommend([card("10"), card("5")], card("10", "hearts"), false, false, 4);
    expect(result.action).toBe("stand");
    expect(result.deviationApplied).toBe(true);
  });

  test("12 vs 3 stands at TC >= 2", () => {
    const result = recommend([card("9"), card("3")], card("3", "hearts"), false, false, 2);
    expect(result.action).toBe("stand");
    expect(result.deviationApplied).toBe(true);
  });
});

describe("bettingAdvice", () => {
  test("recommends minimum at neutral count", () => {
    expect(bettingAdvice(0).units).toBe(1);
  });

  test("scales up with hot true count", () => {
    expect(bettingAdvice(2).units).toBeGreaterThan(1);
    expect(bettingAdvice(4).units).toBeGreaterThan(bettingAdvice(2).units);
  });

  test("stays minimum on cold shoe", () => {
    expect(bettingAdvice(-3).units).toBe(1);
  });
});
