import { Box, Text } from "ink";
import React from "react";
import type { RoundSnapshot } from "../engine/game";
import { scoreHand } from "../engine/hand";

interface StatusPanelProps {
  snapshot: RoundSnapshot;
}

export function StatusPanel({ snapshot }: StatusPanelProps) {
  const active = snapshot.playerHands[snapshot.activeHandIndex];
  const activeTotal = active ? scoreHand(active.cards).total : "N/A";

  return (
    <Box borderStyle="round" borderColor="blueBright" paddingX={2} paddingY={1}>
      <Box marginBottom={1}>
        <Text color="cyanBright" bold>
          TABLE STATUS
        </Text>
      </Box>
      <Text>
        <Text color="white" bold>
          Bankroll:
        </Text>{" "}
        <Text color="greenBright">${snapshot.bankroll.toFixed(2)}</Text>{" "}
        <Text color="white" bold>
          | Current Bet:
        </Text>{" "}
        <Text color="yellowBright">${snapshot.pendingBet}</Text>
      </Text>
      <Text>
        <Text color="white" bold>
          Active Total:
        </Text>{" "}
        <Text color="cyan">{activeTotal}</Text>{" "}
        <Text color="white" bold>
          | Shoe:
        </Text>{" "}
        <Text color="white">{snapshot.shoeRemaining} cards</Text>
      </Text>
    </Box>
  );
}
