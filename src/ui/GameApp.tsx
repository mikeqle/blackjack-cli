import { Box, Text, useApp, useInput } from "ink";
import React, { useEffect, useMemo, useState } from "react";
import { BlackjackGame } from "../engine/game";
import { FooterHelp } from "./FooterHelp";
import { HandView } from "./HandView";
import { APP_OUTER_PADDING_X, getAppLayout } from "./layout";
import { StatusPanel } from "./StatusPanel";

export function GameApp() {
  const { exit } = useApp();
  const game = useMemo(() => new BlackjackGame({ bankroll: 500, minBet: 10, decks: 2 }), []);
  const [snapshot, setSnapshot] = useState(game.snapshot());
  const layout = getAppLayout(process.stdout.columns ?? 80);

  const refresh = () => setSnapshot(game.snapshot());

  useEffect(() => {
    if (snapshot.phase !== "dealer_turn") return;
    const timer = setTimeout(() => {
      game.playDealerToEnd();
      refresh();
    }, 650);

    return () => clearTimeout(timer);
  }, [game, snapshot.phase]);

  useInput((input, key) => {
    if (input === "q") {
      exit();
      return;
    }

    if (snapshot.phase === "betting") {
      if (key.leftArrow) game.adjustBet(-10);
      if (key.rightArrow) game.adjustBet(10);
      if (key.downArrow) game.adjustBet(-50);
      if (key.upArrow) game.adjustBet(50);
      if (key.return || key.space || input === " ") game.startRound();
      refresh();
      return;
    }

    if (snapshot.phase === "player_turn") {
      if (input === "h") game.hit();
      if (input === "s") game.stand();
      if (input === "d") game.doubleDown();
      if (input === "p") game.split();
      refresh();
      return;
    }

    if (snapshot.phase === "round_over") {
      if (key.return || key.space || input === " ") game.nextRoundSameBet();
      if (input === "c") game.nextRound();
      refresh();
    }
  });

  const revealDealer = game.shouldRevealDealer();

  return (
    <Box flexDirection="column" paddingX={APP_OUTER_PADDING_X}>
      <Box flexDirection="column" width={layout.width}>
        <Box width="100%">
          <Text color="magentaBright" bold>
            CLI BLACKJACK
          </Text>
        </Box>

        <StatusPanel snapshot={snapshot} compact={layout.compact} />

        <Box flexDirection="column" width="100%">
          <HandView
            title="Dealer"
            cards={snapshot.dealerCards}
            hiddenIndex={revealDealer ? undefined : 1}
          />
        </Box>

        <Box flexDirection="column" width="100%">
          {snapshot.playerHands.map((hand, idx) => (
            <HandView
              key={`hand-${idx}`}
              title={`Player Hand ${idx + 1} (${hand.bet})`}
              cards={hand.cards}
              active={snapshot.phase === "player_turn" && snapshot.activeHandIndex === idx}
              outcome={snapshot.phase === "round_over" || snapshot.phase === "game_over" ? hand.outcome : undefined}
            />
          ))}
        </Box>

        <Box width="100%">
          <Text>
            <Text color="cyanBright" bold>
              STATUS
            </Text>
            <Text color="white">  {snapshot.message}</Text>
          </Text>
        </Box>

        {snapshot.phase === "round_over" ? (
          <Box width="100%">
            <Text color="yellowBright">
              <Text bold>NEXT ROUND</Text>  <Text color="white" bold>Enter/Space</Text> same bet, <Text color="white" bold>c</Text> change bet.
            </Text>
          </Box>
        ) : null}

        {snapshot.phase === "game_over" ? (
          <Box width="100%">
            <Text color="redBright">
              <Text bold>GAME OVER</Text>  Out of bankroll. Press <Text color="white" bold>q</Text> to quit.
            </Text>
          </Box>
        ) : null}

        <FooterHelp
          phase={snapshot.phase}
          canDouble={game.canDoubleDown()}
          doubleHelp={game.getDoubleDownHelpText()}
          canSplit={game.canSplit()}
          splitHelp={game.getSplitHelpText()}
          compact={layout.compact}
        />
      </Box>
    </Box>
  );
}
