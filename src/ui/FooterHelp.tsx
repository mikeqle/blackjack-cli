import { Box, Text } from "ink";
import React from "react";
import type { Phase } from "../engine/game";

interface FooterHelpProps {
  phase: Phase;
  canDouble: boolean;
  canSplit: boolean;
}

export function FooterHelp({ phase, canDouble, canSplit }: FooterHelpProps) {
  let content = "q Quit";

  if (phase === "betting") {
    content = "←/→ Bet -/+10  |  ↓/↑ Bet -/+50  |  Enter Deal  |  q Quit";
  } else if (phase === "player_turn") {
    content = `h Hit  |  s Stand  |  d Double ${canDouble ? "" : "(N/A)"}  |  p Split ${canSplit ? "" : "(N/A)"}  |  q Quit`;
  } else if (phase === "dealer_turn") {
    content = "Dealer playing...";
  } else if (phase === "round_over") {
    content = "n Next round  |  q Quit";
  } else if (phase === "game_over") {
    content = "Game over: q Quit";
  }

  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1}>
      <Text color="gray">{content}</Text>
    </Box>
  );
}
