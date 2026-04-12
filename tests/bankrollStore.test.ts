import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BankrollStore, DAILY_CREDIT_AMOUNT } from "../src/persistence/bankrollStore";

const tempDirs: string[] = [];

function createStore(): { store: BankrollStore; dbPath: string } {
  const dir = mkdtempSync(join(tmpdir(), "blackjack-store-test-"));
  tempDirs.push(dir);
  const dbPath = join(dir, "blackjack.db");
  return { store: new BankrollStore(dbPath), dbPath };
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (!dir) continue;
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("BankrollStore", () => {
  test("applies daily credit only once per local calendar day on app open", () => {
    const { store, dbPath } = createStore();
    const firstOpen = store.bootstrapSession();
    store.close();

    const reopened = new BankrollStore(dbPath);
    const secondOpen = reopened.bootstrapSession();
    reopened.close();

    expect(firstOpen.dailyCreditApplied).toBe(true);
    expect(firstOpen.balance).toBe(DAILY_CREDIT_AMOUNT);
    expect(secondOpen.dailyCreditApplied).toBe(false);
    expect(secondOpen.balance).toBe(DAILY_CREDIT_AMOUNT);
  });

  test("persists latest bankroll after each change", () => {
    const { store, dbPath } = createStore();
    store.bootstrapSession();
    store.persistBalance(735);
    store.close();

    const reopened = new BankrollStore(dbPath);
    const state = reopened.bootstrapSession();
    reopened.close();

    expect(state.dailyCreditApplied).toBe(false);
    expect(state.balance).toBe(735);
  });

  test("keeps the maximum high score value", () => {
    const { store, dbPath } = createStore();
    store.bootstrapSession();
    store.persistHighScore(2000);
    store.persistHighScore(1500);
    store.close();

    const reopened = new BankrollStore(dbPath);
    const state = reopened.bootstrapSession();
    reopened.close();

    expect(state.highScore).toBe(2000);
  });
});
