import { cardValue, type Card, type Rank } from "./cards";
import { scoreHand } from "./hand";

export type Action = "hit" | "stand" | "double" | "split";

export interface Recommendation {
  action: Action;
  reason: string;
  deviationApplied: boolean;
}

export interface BetAdvice {
  units: number;
  vibe: string;
}

function upcardValue(rank: Rank): number {
  if (rank === "A") return 11;
  return cardValue(rank);
}

function pairRank(cards: Card[]): Rank | null {
  if (cards.length !== 2) return null;
  if (cardValue(cards[0].rank) !== cardValue(cards[1].rank)) return null;
  return cards[0].rank;
}

function softTotal(cards: Card[]): number | null {
  const score = scoreHand(cards);
  return score.soft ? score.total : null;
}

function recommendPair(rank: Rank, up: number): Action | null {
  const r = rank === "10" || rank === "J" || rank === "Q" || rank === "K" ? "T" : rank;
  switch (r) {
    case "A":
    case "8":
      return "split";
    case "T":
      return "stand";
    case "9":
      if (up === 7 || up === 10 || up === 11) return "stand";
      return "split";
    case "7":
      return up <= 7 ? "split" : "hit";
    case "6":
      return up >= 2 && up <= 6 ? "split" : "hit";
    case "5":
      return up >= 2 && up <= 9 ? "double" : "hit";
    case "4":
      return up === 5 || up === 6 ? "split" : "hit";
    case "3":
    case "2":
      return up >= 2 && up <= 7 ? "split" : "hit";
    default:
      return null;
  }
}

function recommendSoft(total: number, up: number, twoCards: boolean): Action {
  if (total >= 20) return "stand";
  if (total === 19) {
    if (twoCards && up === 6) return "double";
    return "stand";
  }
  if (total === 18) {
    if (twoCards && up >= 3 && up <= 6) return "double";
    if (up >= 9) return "hit";
    return "stand";
  }
  if (total === 17) {
    if (twoCards && up >= 3 && up <= 6) return "double";
    return "hit";
  }
  if (total === 16 || total === 15) {
    if (twoCards && up >= 4 && up <= 6) return "double";
    return "hit";
  }
  if (total === 14 || total === 13) {
    if (twoCards && up >= 5 && up <= 6) return "double";
    return "hit";
  }
  return "hit";
}

function recommendHard(total: number, up: number, twoCards: boolean): Action {
  if (total >= 17) return "stand";
  if (total >= 13) return up <= 6 ? "stand" : "hit";
  if (total === 12) return up >= 4 && up <= 6 ? "stand" : "hit";
  if (total === 11) return twoCards ? "double" : "hit";
  if (total === 10) {
    if (twoCards && up <= 9) return "double";
    return "hit";
  }
  if (total === 9) {
    if (twoCards && up >= 3 && up <= 6) return "double";
    return "hit";
  }
  return "hit";
}

interface Deviation {
  baseline: Action;
  deviated: Action;
  threshold: number;
  reason: string;
}

function applyIllustrious18(
  baseline: Action,
  hard: number,
  up: number,
  twoCards: boolean,
  trueCount: number
): Deviation | null {
  const dev = (threshold: number, deviated: Action, reason: string): Deviation => ({
    baseline,
    deviated,
    threshold,
    reason
  });

  if (hard === 16 && up === 10 && trueCount >= 0) {
    return dev(0, "stand", "16 vs 10: stand at TC >= 0 (I18)");
  }
  if (hard === 15 && up === 10 && trueCount >= 4) {
    return dev(4, "stand", "15 vs 10: stand at TC >= 4 (I18)");
  }
  if (hard === 12 && up === 3 && trueCount >= 2) {
    return dev(2, "stand", "12 vs 3: stand at TC >= 2 (I18)");
  }
  if (hard === 12 && up === 2 && trueCount >= 3) {
    return dev(3, "stand", "12 vs 2: stand at TC >= 3 (I18)");
  }
  if (twoCards && hard === 11 && up === 11 && trueCount >= 1) {
    return dev(1, "double", "11 vs A: double at TC >= 1 (I18)");
  }
  if (twoCards && hard === 9 && up === 2 && trueCount >= 1) {
    return dev(1, "double", "9 vs 2: double at TC >= 1 (I18)");
  }
  if (twoCards && hard === 10 && up === 10 && trueCount >= 4) {
    return dev(4, "double", "10 vs 10: double at TC >= 4 (I18)");
  }
  if (twoCards && hard === 9 && up === 7 && trueCount >= 3) {
    return dev(3, "double", "9 vs 7: double at TC >= 3 (I18)");
  }
  if (hard === 16 && up === 9 && trueCount >= 5) {
    return dev(5, "stand", "16 vs 9: stand at TC >= 5 (I18)");
  }
  if (hard === 13 && up === 2 && trueCount <= -1) {
    return dev(-1, "hit", "13 vs 2: hit at TC <= -1 (I18)");
  }
  if (hard === 12 && up === 4 && trueCount <= 0) {
    return dev(0, "hit", "12 vs 4: hit at TC <= 0 (I18)");
  }
  if (hard === 12 && up === 5 && trueCount <= -2) {
    return dev(-2, "hit", "12 vs 5: hit at TC <= -2 (I18)");
  }
  if (hard === 12 && up === 6 && trueCount <= -1) {
    return dev(-1, "hit", "12 vs 6: hit at TC <= -1 (I18)");
  }
  if (hard === 13 && up === 3 && trueCount <= -2) {
    return dev(-2, "hit", "13 vs 3: hit at TC <= -2 (I18)");
  }

  return null;
}

export function recommend(
  playerCards: Card[],
  dealerUp: Card,
  canSplitNow: boolean,
  canDoubleNow: boolean,
  trueCount: number
): Recommendation {
  const up = upcardValue(dealerUp.rank);
  const twoCards = playerCards.length === 2;

  const pair = pairRank(playerCards);
  if (pair && canSplitNow) {
    const pairAction = recommendPair(pair, up);
    if (pairAction === "split") {
      return { action: "split", reason: `Split ${pair}s vs ${up}`, deviationApplied: false };
    }
    if (pairAction === "double" && canDoubleNow) {
      return { action: "double", reason: `Pair of ${pair}s plays as 10 — double vs ${up}`, deviationApplied: false };
    }
    if (pairAction === "stand") {
      return { action: "stand", reason: `Don't split ${pair}s vs ${up} — stand`, deviationApplied: false };
    }
  }

  const soft = softTotal(playerCards);
  if (soft != null) {
    const action = recommendSoft(soft, up, twoCards);
    const final = action === "double" && !canDoubleNow ? (soft >= 18 ? "stand" : "hit") : action;
    return {
      action: final,
      reason: `Soft ${soft} vs ${up}`,
      deviationApplied: false
    };
  }

  const hard = scoreHand(playerCards).total;
  const baseline = recommendHard(hard, up, twoCards);

  const dev = applyIllustrious18(baseline, hard, up, twoCards, trueCount);
  if (dev) {
    const final = dev.deviated === "double" && !canDoubleNow ? (hard >= 11 ? "stand" : "hit") : dev.deviated;
    return { action: final, reason: dev.reason, deviationApplied: true };
  }

  const final = baseline === "double" && !canDoubleNow ? "hit" : baseline;
  return { action: final, reason: `Hard ${hard} vs ${up}`, deviationApplied: false };
}

export function bettingAdvice(trueCount: number): BetAdvice {
  if (trueCount >= 4) return { units: 8, vibe: "Hot shoe. Big player up." };
  if (trueCount >= 2) return { units: 4, vibe: "Count is friendly. Raise it." };
  if (trueCount >= 1) return { units: 2, vibe: "Slight edge. Press a little." };
  if (trueCount <= -2) return { units: 1, vibe: "Cold shoe. Min bet, stay sharp." };
  return { units: 1, vibe: "Neutral. Play the minimum." };
}
