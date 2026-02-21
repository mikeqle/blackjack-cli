import { Box, Text } from "ink";
import React from "react";
import type { RoundSnapshot } from "../engine/game";
import { scoreHand } from "../engine/hand";

interface StatusPanelProps {
  snapshot: RoundSnapshot;
}

export function StatusPanel({ snapshot }: StatusPanelProps) {
  const active = snapshot.playerHands[snapshot.activeHandIndex];

  return (
    <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1}>
      <Text>
        Bankroll: <Text color="green">${snapshot.bankroll.toFixed(2)}</Text> | Bet: <Text color="yellow">${snapshot.pendingBet}</Text>
        {active ? ` | Active hand total: ${scoreHand(active.cards).total}` : ""}
        {` | Shoe: ${snapshot.shoeRemaining} cards`}
      </Text>
    </Box>
  );
}
