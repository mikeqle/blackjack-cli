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

- `n`: Next round
- `q`: Quit

## Rules implemented

- Single-player vs dealer
- 52-card deck shoe (2 decks by default), reshuffles when low
- Dealer stands on soft 17
- Split and double-down support (when bankroll/rules allow)
- Natural blackjack pays 3:2
- Bankroll and bet tracking per hand
