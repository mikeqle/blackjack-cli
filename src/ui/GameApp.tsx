import { Box, Newline, Text, useApp, useInput } from "ink";
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
    <Box flexDirection="column" padding={1}>
      <Text color="magentaBright">CLI Blackjack</Text>
      <StatusPanel snapshot={snapshot} />

      <HandView
        title="Dealer"
        cards={snapshot.dealerCards}
        hiddenIndex={revealDealer ? undefined : 1}
      />

      {snapshot.playerHands.map((hand, idx) => (
        <HandView
          key={`hand-${idx}`}
          title={`Player Hand ${idx + 1} (${hand.bet})`}
          cards={hand.cards}
          active={snapshot.phase === "player_turn" && snapshot.activeHandIndex === idx}
          outcome={snapshot.phase === "round_over" || snapshot.phase === "game_over" ? hand.outcome : undefined}
        />
      ))}

      <Text>
        <Text color="cyan">Status:</Text> {snapshot.message}
      </Text>

      {snapshot.phase === "round_over" ? (
        <Text color="yellow">
          <Newline />
          Press <Text color="white">n</Text> to start the next round.
        </Text>
      ) : null}

      {snapshot.phase === "game_over" ? (
        <Text color="red">
          <Newline />
          Out of bankroll. Press <Text color="white">q</Text> to quit.
        </Text>
      ) : null}

      <Box marginTop={1}>
        <FooterHelp phase={snapshot.phase} canDouble={game.canDoubleDown()} canSplit={game.canSplit()} />
      </Box>
    </Box>
  );
}
