import { Box, Text } from "ink";
import React from "react";
import { SUIT_COLOR, SUIT_SYMBOL, type Card } from "../engine/cards";

interface CardViewProps {
  card?: Card;
  hidden?: boolean;
  key?: string;
}

export function CardView({ card, hidden = false }: CardViewProps) {
  if (hidden || !card) {
    return (
      <Box marginRight={2}>
        <Text color="white">[??]</Text>
      </Box>
    );
  }

  return (
    <Box marginRight={2}>
      <Text color={SUIT_COLOR[card.suit] === "red" ? "red" : "white"}>
        [{card.rank}
        {SUIT_SYMBOL[card.suit]}]
      </Text>
    </Box>
  );
}
