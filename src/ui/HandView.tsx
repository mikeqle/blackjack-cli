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
    <Box
      flexDirection="column"
      marginBottom={1}
      borderStyle="round"
      borderColor={active ? "yellowBright" : "cyan"}
      paddingX={2}
      paddingY={1}
    >
      <Text color={active ? "yellowBright" : "cyanBright"} bold>
        {title}
      </Text>
      <Box marginTop={1} marginBottom={1}>
        {cards.map((card, idx) => (
          <CardView key={`${card.rank}-${card.suit}-${idx}`} card={card} hidden={idx === hiddenIndex} />
        ))}
      </Box>
      <Text>
        <Text color="white" bold>
          Total:
        </Text>{" "}
        <Text color="white">{hiddenIndex === undefined ? score.total : "?"}</Text>
        {hiddenIndex === undefined && score.soft ? " (soft)" : ""}
      </Text>
      {outcome ? (
        <Text color={outcome === "lose" ? "redBright" : outcome === "push" ? "yellowBright" : "greenBright"}>
          <Text bold>Outcome:</Text> {outcome.toUpperCase()}
        </Text>
      ) : null}
    </Box>
  );
}
