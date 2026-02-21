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

  const separator = <Text color="gray">  |  </Text>;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
      <Box marginBottom={1}>
        <Text color="cyanBright" bold>
          CONTROLS
        </Text>
      </Box>

      {phase === "betting" ? (
        <Text>
          {key("←/→")}
          <Text> </Text>
          {label("Bet -/+10")}
          {separator}
          {key("↓/↑")}
          <Text> </Text>
          {label("Bet -/+50")}
          {separator}
          {key("Enter/Space")}
          <Text> </Text>
          {label("Deal")}
          {separator}
          {key("q")}
          <Text> </Text>
          {label("Quit")}
        </Text>
      ) : null}

      {phase === "player_turn" ? (
        <Text>
          {key("h")}
          <Text> </Text>
          {label("Hit")}
          {separator}
          {key("s")}
          <Text> </Text>
          {label("Stand")}
          {separator}
          {key("d")}
          <Text> </Text>
          {label(`Double${canDouble ? "" : " (N/A)"}`)}
          {separator}
          {key("p")}
          <Text> </Text>
          {label(`Split${canSplit ? "" : " (N/A)"}`)}
          {separator}
          {key("q")}
          <Text> </Text>
          {label("Quit")}
        </Text>
      ) : null}

      {phase === "dealer_turn" ? (
        <Text color="yellowBright">
          <Text bold>WAIT</Text>  Dealer playing...
        </Text>
      ) : null}

      {phase === "round_over" ? (
        <Text>
          {key("n")}
          <Text> </Text>
          {label("Next round")}
          {separator}
          {key("q")}
          <Text> </Text>
          {label("Quit")}
        </Text>
      ) : null}

      {phase === "game_over" ? (
        <Text>
          {key("q")}
          <Text> </Text>
          {label("Quit")}
        </Text>
      ) : null}
    </Box>
  );
}
