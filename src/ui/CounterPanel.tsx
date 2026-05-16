import { Box, Newline, Text } from "ink";
import React from "react";
import type { RoundSnapshot } from "../engine/game";
import { PANEL_PADDING_X } from "./layout";

interface CounterPanelProps {
  snapshot: RoundSnapshot;
  enabled: boolean;
}

function trueCountColor(tc: number): string {
  if (tc >= 3) return "greenBright";
  if (tc >= 1) return "green";
  if (tc <= -2) return "redBright";
  if (tc <= 0) return "yellow";
  return "white";
}

function actionColor(action: string): string {
  switch (action) {
    case "hit":
      return "yellowBright";
    case "stand":
      return "greenBright";
    case "double":
      return "magentaBright";
    case "split":
      return "cyanBright";
    default:
      return "white";
  }
}

function actionLabel(action: string): string {
  if (action === "hit") return "HIT";
  if (action === "stand") return "STAND";
  if (action === "double") return "DOUBLE";
  if (action === "split") return "SPLIT";
  return action.toUpperCase();
}

export function CounterPanel({ snapshot, enabled }: CounterPanelProps) {
  if (!enabled) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={PANEL_PADDING_X} width="100%">
        <Text color="gray">
          <Text bold>MR. ROSA</Text> Card counter hidden. Press <Text color="white" bold>t</Text> to enlist in the team.
        </Text>
      </Box>
    );
  }

  const { count, recommendation, betAdvice, phase } = snapshot;
  const separator = <Text color="gray"> | </Text>;
  const tcColor = trueCountColor(count.trueCount);

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="magentaBright" paddingX={PANEL_PADDING_X} width="100%">
      <Text color="magentaBright" bold>
        COUNTER (Hi-Lo)
        <Newline />
      </Text>
      <Text>
        <Text color="white" bold>RC:</Text>{" "}
        <Text color={tcColor}>{count.running >= 0 ? `+${count.running}` : count.running}</Text>
        {separator}
        <Text color="white" bold>TC:</Text>{" "}
        <Text color={tcColor}>{count.trueCount >= 0 ? `+${count.trueCount.toFixed(1)}` : count.trueCount.toFixed(1)}</Text>
        {separator}
        <Text color="white" bold>Decks left:</Text>{" "}
        <Text color="white">{count.decksRemaining.toFixed(1)}</Text>
        {separator}
        <Text color="white" bold>Seen:</Text>{" "}
        <Text color="white">{count.cardsSeen}</Text>
      </Text>
      {phase === "betting" || phase === "round_over" ? (
        <Text>
          <Text color="white" bold>Bet signal:</Text>{" "}
          <Text color={tcColor}>{betAdvice.units}u</Text>
          <Text color="gray"> — </Text>
          <Text color="white">{betAdvice.vibe}</Text>
        </Text>
      ) : null}
      {recommendation ? (
        <Text>
          <Text color="white" bold>Play:</Text>{" "}
          <Text color={actionColor(recommendation.action)} bold>{actionLabel(recommendation.action)}</Text>
          <Text color="gray"> — </Text>
          <Text color="white">{recommendation.reason}</Text>
          {recommendation.deviationApplied ? <Text color="magentaBright" bold> *deviation</Text> : null}
        </Text>
      ) : null}
    </Box>
  );
}
