import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { Database } from "bun:sqlite";

export const DAILY_CREDIT_AMOUNT = 1000;

interface ProfileRow {
  balance: number;
  highScore: number;
  lastCreditDate: string | null;
}

export interface SessionState {
  balance: number;
  highScore: number;
  dailyCreditApplied: boolean;
  dailyCreditAmount: number;
}

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultDatabasePath(): string {
  return join(homedir(), ".blackjack-cli", "blackjack.db");
}

export class BankrollStore {
  private readonly db: Database;

  constructor(private readonly databasePath = getDefaultDatabasePath()) {
    mkdirSync(dirname(this.databasePath), { recursive: true });
    this.db = new Database(this.databasePath);
    this.initializeSchema();
  }

  bootstrapSession(): SessionState {
    const today = getLocalDateKey();
    const profile = this.getProfile();
    const dailyCreditApplied = profile.lastCreditDate !== today;

    if (dailyCreditApplied) {
      const nextBalance = profile.balance + DAILY_CREDIT_AMOUNT;
      this.db
        .query(
          "UPDATE player_profile SET balance = ?, last_credit_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1"
        )
        .run(nextBalance, today);
      profile.balance = nextBalance;
      profile.lastCreditDate = today;
    }

    return {
      balance: profile.balance,
      highScore: profile.highScore,
      dailyCreditApplied,
      dailyCreditAmount: DAILY_CREDIT_AMOUNT
    };
  }

  persistBalance(balance: number): void {
    this.db
      .query("UPDATE player_profile SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1")
      .run(balance);
  }

  persistHighScore(highScore: number): void {
    this.db
      .query(
        "UPDATE player_profile SET high_score = CASE WHEN ? > high_score THEN ? ELSE high_score END, updated_at = CURRENT_TIMESTAMP WHERE id = 1"
      )
      .run(highScore, highScore);
  }

  close(): void {
    this.db.close();
  }

  private initializeSchema(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS player_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        balance REAL NOT NULL DEFAULT 0,
        high_score REAL NOT NULL DEFAULT 0,
        last_credit_date TEXT,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    this.db.run(`
      INSERT INTO player_profile (id, balance, high_score, last_credit_date)
      SELECT 1, 0, 0, NULL
      WHERE NOT EXISTS (
        SELECT 1 FROM player_profile WHERE id = 1
      );
    `);
  }

  private getProfile(): ProfileRow {
    const row = this.db
      .query(
        "SELECT balance AS balance, high_score AS highScore, last_credit_date AS lastCreditDate FROM player_profile WHERE id = 1"
      )
      .get() as ProfileRow | null;

    if (!row) {
      throw new Error("Failed to load bankroll profile.");
    }

    return row;
  }
}
