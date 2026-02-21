import { Box, Text, useApp, useInput } from "ink";
import React, { useEffect, useMemo, useState } from "react";
import { BlackjackGame } from "../engine/game";
import { FooterHelp } from "./FooterHelp";
import { HandView } from "./HandView";
import { StatusPanel } from "./StatusPanel";

export function GameApp() {
  const { exit } = useApp();
  const game = useMemo(() => new BlackjackGame({ bankroll: 500, minBet: 10, decks: 2 }), []);
  const [snapshot, setSnapshot] = useState(game.snapshot());

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
      if (key.return || key.space) game.startRound();
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

    if (snapshot.phase === "round_over" && input === "n") {
      game.nextRound();
      refresh();
    }
  });

  const revealDealer = game.shouldRevealDealer();

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box>
        <Text color="magentaBright" bold>
          CLI BLACKJACK
        </Text>
      </Box>

      <Box>
        <StatusPanel snapshot={snapshot} />
      </Box>

      <Box flexDirection="column">
        <HandView
          title="Dealer"
          cards={snapshot.dealerCards}
          hiddenIndex={revealDealer ? undefined : 1}
        />
      </Box>

      <Box flexDirection="column">
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

      <Box>
        <Text>
          <Text color="cyanBright" bold>
            STATUS
          </Text>
          <Text color="white">  {snapshot.message}</Text>
        </Text>
      </Box>

      {snapshot.phase === "round_over" ? (
        <Box>
          <Text color="yellowBright">
            <Text bold>NEXT ROUND</Text>  Press <Text color="white" bold>n</Text> to continue.
          </Text>
        </Box>
      ) : null}

      {snapshot.phase === "game_over" ? (
        <Box>
          <Text color="redBright">
            <Text bold>GAME OVER</Text>  Out of bankroll. Press <Text color="white" bold>q</Text> to quit.
          </Text>
        </Box>
      ) : null}

      <Box>
        <FooterHelp phase={snapshot.phase} canDouble={game.canDoubleDown()} canSplit={game.canSplit()} />
      </Box>
    </Box>
  );
}
