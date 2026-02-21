import { Box, Text } from "ink";
import React from "react";
import type { Card } from "../engine/cards";
import { scoreHand } from "../engine/hand";
import { CardView } from "./CardView";

interface HandViewProps {
  title: string;
  cards: Card[];
  hiddenIndex?: number;
  active?: boolean;
  outcome?: string;
  key?: string;
}

export function HandView({ title, cards, hiddenIndex, active = false, outcome }: HandViewProps) {
  const visibleCards = cards.filter((_, idx) => idx !== hiddenIndex);
  const score = scoreHand(visibleCards);

  return (
    <Box flexDirection="column" marginBottom={1} borderStyle="round" borderColor={active ? "yellow" : "gray"} paddingX={1}>
      <Text color={active ? "yellow" : "cyan"}>{title}</Text>
      <Box>
        {cards.map((card, idx) => (
          <CardView key={`${card.rank}-${card.suit}-${idx}`} card={card} hidden={idx === hiddenIndex} />
        ))}
      </Box>
      <Text>
        Total: {hiddenIndex === undefined ? score.total : "?"}
        {hiddenIndex === undefined && score.soft ? " (soft)" : ""}
      </Text>
      {outcome ? <Text color={outcome === "lose" ? "red" : outcome === "push" ? "yellow" : "green"}>Outcome: {outcome}</Text> : null}
    </Box>
  );
}
