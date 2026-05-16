import { describe, expect, test } from "bun:test";
import type { Card } from "../src/engine/cards";
import { Shoe } from "../src/engine/deck";

describe("Shoe", () => {
  test("fires onDraw for every card and onReshuffle when refilled", () => {
    const shoe = new Shoe(1, 0);
    const drawn: Card[] = [];
    let reshuffleCount = 0;
    shoe.setObserver({
      onDraw: (card) => drawn.push(card),
      onReshuffle: () => {
        reshuffleCount += 1;
      }
    });

    shoe.draw();
    expect(drawn.length).toBe(1);
    expect(reshuffleCount).toBe(0);

    while (shoe.remaining() > 0) {
      shoe.draw();
    }
    expect(drawn.length).toBe(52);

    shoe.draw();
    expect(reshuffleCount).toBeGreaterThanOrEqual(1);
    expect(drawn.length).toBe(53);
  });

  test("totalCards reports decks * 52", () => {
    expect(new Shoe(1, 0).totalCards()).toBe(52);
    expect(new Shoe(6, 0).totalCards()).toBe(312);
  });
});
