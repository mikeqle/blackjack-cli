import { Box, Text, useApp, useInput } from "ink";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BlackjackGame, type Phase } from "../engine/game";
import { BankrollStore } from "../persistence/bankrollStore";
import { CounterPanel } from "./CounterPanel";
import { FooterHelp } from "./FooterHelp";
import { HandView } from "./HandView";
import { APP_OUTER_PADDING_X, getAppLayout } from "./layout";
import { StatusPanel } from "./StatusPanel";

const MIN_BET = 10;
const DECKS = 8;

function isHandEndPhase(phase: Phase): boolean {
  return phase === "round_over" || phase === "game_over";
}

function getNextDailyCreditDateLabel(date = new Date()): string {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  const year = next.getFullYear();
  const month = `${next.getMonth() + 1}`.padStart(2, "0");
  const day = `${next.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function GameApp() {
  const { exit } = useApp();
  const session = useMemo(() => {
    const store = new BankrollStore();
    const state = store.bootstrapSession();
    const initialMessage = state.dailyCreditApplied
      ? `Daily credit received: +$${state.dailyCreditAmount}. Set your bet to begin.`
      : undefined;

    const game = new BlackjackGame({
      bankroll: state.balance,
      minBet: MIN_BET,
      decks: DECKS,
      initialMessage
    });

    return {
      game,
      store,
      initialRunMax: state.balance,
      initialHighScore: state.highScore
    };
  }, []);
  const { game, store, initialRunMax, initialHighScore } = session;
  const [snapshot, setSnapshot] = useState(game.snapshot());
  const [runMaxBalance, setRunMaxBalance] = useState(initialRunMax);
  const [highScore, setHighScore] = useState(initialHighScore);
  const [counterEnabled, setCounterEnabled] = useState(false);
  const nextDailyCreditDate = useMemo(() => getNextDailyCreditDateLabel(), []);
  const layout = getAppLayout(process.stdout.columns ?? 80);
  const runMaxRef = useRef(initialRunMax);
  const highScoreRef = useRef(initialHighScore);
  const previousPhaseRef = useRef(snapshot.phase);

  const refresh = () => setSnapshot(game.snapshot());

  useEffect(
    () => () => {
      store.close();
    },
    [store]
  );

  useEffect(() => {
    store.persistBalance(snapshot.bankroll);

    const nextRunMax = Math.max(runMaxRef.current, snapshot.bankroll);
    if (nextRunMax !== runMaxRef.current) {
      runMaxRef.current = nextRunMax;
      setRunMaxBalance(nextRunMax);
    }

    const enteredHandEnd = isHandEndPhase(snapshot.phase) && !isHandEndPhase(previousPhaseRef.current);
    if (enteredHandEnd && nextRunMax > highScoreRef.current) {
      store.persistHighScore(nextRunMax);
      highScoreRef.current = nextRunMax;
      setHighScore(nextRunMax);
    }

    previousPhaseRef.current = snapshot.phase;
  }, [snapshot.bankroll, snapshot.phase, store]);

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

    if (input === "t") {
      setCounterEnabled(!counterEnabled);
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

        <StatusPanel
          snapshot={snapshot}
          runMaxBalance={runMaxBalance}
          highScore={highScore}
          nextDailyCreditDate={nextDailyCreditDate}
          compact={layout.compact}
        />

        <CounterPanel snapshot={snapshot} enabled={counterEnabled} />

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
          pendingBet={snapshot.pendingBet}
        />
      </Box>
    </Box>
  );
}
