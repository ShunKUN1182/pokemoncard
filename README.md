# PCP Ranking System

PCP Ranking System is a Pokémon card deck ranking web application built with React, TypeScript, Vite, and Supabase.

## Project Overview

This service ranks deck PCP points using match results. Decks start at 1500 PCP and gain or lose PCP based on results, match types, and PCL bonuses.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- SCSS
- Supabase

## Setup

1. Install dependencies:
    ```bash
    npm install
    ```
2. Copy environment variables:
    ```bash
    cp .env.example .env
    ```
3. Fill in `.env` with your Supabase project values.

## Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Supabase Setup

Create the following tables in Supabase:

- `decks`
- `tournaments`
- `matches`
- `tournament_results`

You can use the provided SQL schema at `supabase/schema.sql`.

### Recommended Supabase setup

1. Open the Supabase SQL editor.
2. Paste or run the SQL in `supabase/schema.sql`.
3. Verify tables and enum types are created.
4. Register initial decks and tournaments using the Supabase table editor.

### Optional security

- Enable Row Level Security (RLS) if you want to restrict match registration.
- Use Supabase Auth to allow only admin users to register matches.

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## PCP Rules Summary

- Start with 1500 PCP
- Win: +20 × match multiplier
- Loss: -20 × match multiplier
- Upset win: +10 bonus if opponent PCP is 100 higher or more
- Upset loss: penalty reduced by 10
- PCL result bonuses: BEST4 +70, runner_up +120, champion +200

pcp_ranking_2026