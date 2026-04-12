import { Box, Newline, Text } from "ink";
import React from "react";
import type { RoundSnapshot } from "../engine/game";
import { scoreHand } from "../engine/hand";
import { PANEL_PADDING_X } from "./layout";

interface StatusPanelProps {
  snapshot: RoundSnapshot;
  runMaxBalance: number;
  highScore: number;
  nextDailyCreditDate: string;
  compact?: boolean;
}

export function StatusPanel({ snapshot, runMaxBalance, highScore, nextDailyCreditDate, compact = false }: StatusPanelProps) {
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
      <Text>
        <Text color="white" bold>
          Run Max:
        </Text>{" "}
        <Text color="greenBright">${runMaxBalance.toFixed(2)}</Text>
        {separator}
        <Text color="white" bold>
          High Score:
        </Text>{" "}
        <Text color="greenBright">${highScore.toFixed(2)}</Text>
      </Text>
      {snapshot.phase === "game_over" ? (
        <Text>
          <Text color="white" bold>
            Next Daily Credit:
          </Text>{" "}
          <Text color="yellowBright">{nextDailyCreditDate}</Text>
          <Text color="gray"> (local)</Text>
        </Text>
      ) : null}
    </Box>
  );
}
