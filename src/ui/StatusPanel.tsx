import { Box, Newline, Text } from "ink";
import React from "react";
import type { RoundSnapshot } from "../engine/game";
import { scoreHand } from "../engine/hand";
import { PANEL_PADDING_X } from "./layout";

interface StatusPanelProps {
  snapshot: RoundSnapshot;
  compact?: boolean;
}

export function StatusPanel({ snapshot, compact = false }: StatusPanelProps) {
  const active = snapshot.playerHands[snapshot.activeHandIndex];
  const activeTotal = active ? scoreHand(active.cards).total : "N/A";
  const separator = <Text color="gray"> | </Text>;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="blueBright" paddingX={PANEL_PADDING_X} width="100%">
      <Box width="100%">
        <Text color="cyanBright" bold>
          TABLE STATUS
          <Newline />
        </Text>
      </Box>
      <Text>
        <Text color="white" bold>
          Bankroll:
        </Text>{" "}
        <Text color="greenBright">${snapshot.bankroll.toFixed(2)}</Text>
        {separator}
        <Text color="white" bold>
          Bet:
        </Text>{" "}
        <Text color="yellowBright">${snapshot.pendingBet}</Text>
        {!compact ? separator : null}
        {compact ? <Newline /> : null}
        <Text color="white" bold>
          Active Total:
        </Text>{" "}
        <Text color="cyan">{activeTotal}</Text>
        {separator}
        <Text color="white" bold>
          Shoe:
        </Text>{" "}
        <Text color="white">{snapshot.shoeRemaining} cards</Text>
      </Text>
    </Box>
  );
}
