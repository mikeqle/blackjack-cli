import { Box, Text } from "ink";
import React from "react";
import type { Card } from "../engine/cards";
import { scoreHand } from "../engine/hand";
import { CardView } from "./CardView";
import { PANEL_PADDING_X } from "./layout";

interface HandViewProps {
  title: string;
  cards: Card[];
  hiddenIndex?: number;
  active?: boolean;
  outcome?: string;
  width?: number | string;
  key?: string;
}

export function HandView({ title, cards, hiddenIndex, active = false, outcome, width = "100%" }: HandViewProps) {
  const visibleCards = cards.filter((_, idx) => idx !== hiddenIndex);
  const score = scoreHand(visibleCards);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={active ? "yellowBright" : "cyan"}
      paddingX={PANEL_PADDING_X}
      width={width}
    >
      <Text color={active ? "yellowBright" : "cyanBright"} bold>
        {title}
      </Text>
      <Box>
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
