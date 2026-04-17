# Initnomo

Initnomo is an Initia-focused binary options trading app built with Next.js.

## Links

- Live: 
- Repository: https://github.com/0xamaan-dev/Initnomo
- Pitch Deck: https://docs.google.com/presentation/d/1cZuB4i57buCZ2ZyNFNVLxY-qlLUSyTV33J7doVjnMi8/edit?usp=sharing

## Scope

This repository is now configured for **Initia-only** operation:

- Initia wallet connection (InterwovenKit)
- Initia treasury and balance flows
- Initia-focused landing, leaderboard, profile, referrals, rewards

## Environment Setup

1. Copy env template:

```bash
cp .env.example .env
```

2. Fill required values in `.env`:

- Core app values
- Supabase keys
- Balance API secrets
- Initia RPC / chain / treasury values

## Local Development

```bash
yarn install
yarn dev
```

App runs at `http://localhost:3000`.

## Scripts

```bash
yarn dev
yarn build
yarn lint
yarn test
```
