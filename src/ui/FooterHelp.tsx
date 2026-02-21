import { Box, Text } from "ink";
import React from "react";
import type { Phase } from "../engine/game";

interface FooterHelpProps {
  phase: Phase;
  canDouble: boolean;
  canSplit: boolean;
}

export function FooterHelp({ phase, canDouble, canSplit }: FooterHelpProps) {
  const key = (value: string) => (
    <Text color="white" bold>
      {value}
    </Text>
  );

  const label = (value: string) => <Text color="cyanBright">{value}</Text>;

  const separator = <Text color="gray"> | </Text>;

  const renderBody = () => {
    if (phase === "betting") {
      return (
        <>
          <Text>
            {key("←/→")} <Text>{label("Bet -/+10")}</Text>
            {separator}
            {key("↓/↑")} <Text>{label("Bet -/+50")}</Text>
            {separator}
            {key("Enter/Space")} <Text>{label("Deal")}</Text>
          </Text>
          <Text>
            {key("q")} <Text>{label("Quit")}</Text>
          </Text>
        </>
      );
    }

    if (phase === "player_turn") {
      return (
        <>
          <Text>
            {key("h")} <Text>{label("Hit")}</Text>
            {separator}
            {key("s")} <Text>{label("Stand")}</Text>
            {separator}
            {key("d")} <Text>{label(`Double${canDouble ? "" : " (N/A)"}`)}</Text>
          </Text>
          <Text>
            {key("p")} <Text>{label(`Split${canSplit ? "" : " (N/A)"}`)}</Text>
            {separator}
            {key("q")} <Text>{label("Quit")}</Text>
          </Text>
        </>
      );
    }

    if (phase === "dealer_turn") {
      return (
        <>
          <Text color="yellowBright">
            <Text bold>WAIT</Text> Dealer playing...
          </Text>
          <Text>
            {key("q")} <Text>{label("Quit")}</Text>
          </Text>
        </>
      );
    }

    if (phase === "round_over") {
      return (
        <>
          <Text>
            {key("n")} <Text>{label("Next round")}</Text>
            {separator}
            {key("q")} <Text>{label("Quit")}</Text>
          </Text>
          <Text> </Text>
        </>
      );
    }

    return (
      <>
        <Text>
          {key("q")} <Text>{label("Quit")}</Text>
        </Text>
        <Text> </Text>
      </>
    );
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1} minHeight={5}>
      <Box>
        <Text color="cyanBright" bold>
          CONTROLS
        </Text>
      </Box>
      {renderBody()}
    </Box>
  );
}
