# CLI Blackjack (Bun + Ink)

Modern terminal Blackjack built with Bun, TypeScript, and Ink (React-style TUI).

## Run

```bash
bun install
bun run game
```

## Scripts

- `bun run game` - Start the interactive game
- `bun run test` - Run unit tests
- `bun run typecheck` - Run TypeScript checks
- `bun run build` - Build entrypoint to `dist/`

## Controls

### Betting phase

- `Left / Right`: Bet `-10 / +10`
- `Down / Up`: Bet `-50 / +50`
- `Enter` or `Space`: Deal cards
- `q`: Quit

### Player turn

- `h`: Hit
- `s`: Stand
- `d`: Double Down (when allowed)
- `p`: Split (when allowed)
- `q`: Quit

### Round over

- `Enter` or `Space`: Next round (same bet)
- `c`: Next round (change bet)
- `q`: Quit

## Rules implemented

- Single-player vs dealer
- 52-card deck shoe (2 decks by default), reshuffles when low
- Dealer stands on soft 17
- Split and double-down support (when bankroll/rules allow)
- Natural blackjack pays 3:2
- Bankroll and bet tracking per hand

## Persistent progression

- Bankroll is persisted in a local SQLite database at `~/.blackjack-cli/blackjack.db`
- On app open, if it is a new local calendar day, `+$1000` is added to your current balance
- If balance drops below minimum bet, the run is over until a new day credit is applied
- Tracks max balance reached in the current run and updates all-time high score at hand end
