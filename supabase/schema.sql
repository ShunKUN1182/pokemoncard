-- Supabase schema for PCP Ranking System

-- Enable UUID generation if needed
create extension if not exists pgcrypto;

-- Match type values used in the application
create type match_type_enum as enum (
  'exhibition',
  'pcl_qualifier',
  'pcl_repechage',
  'pcl_quarterfinal',
  'pcl_semifinal',
  'pcl_final'
);

-- Tournament result values used in the application
create type tournament_result_enum as enum (
  'not_participated',
  'qualifier_eliminated',
  'repechage_eliminated',
  'top8',
  'top4',
  'runner_up',
  'champion'
);

-- Decks table
create table if not exists decks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pcp integer not null default 1500,
  wins integer not null default 0,
  losses integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Tournaments table
create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  number integer not null,
  created_at timestamp with time zone not null default now()
);

-- Matches table
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  deck_a_id uuid not null references decks(id) on delete restrict,
  deck_b_id uuid not null references decks(id) on delete restrict,
  winner_id uuid not null references decks(id) on delete restrict,
  match_type match_type_enum not null,
  tournament_id uuid references tournaments(id) on delete set null,
  round text,
  deck_a_pcp_before integer not null,
  deck_b_pcp_before integer not null,
  deck_a_pcp_change integer not null,
  deck_b_pcp_change integer not null,
  created_at timestamp with time zone not null default now(),
  constraint matches_different_decks check (deck_a_id <> deck_b_id),
  constraint winner_must_be_participant check (winner_id in (deck_a_id, deck_b_id))
);

-- Tournament results table
create table if not exists tournament_results (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  deck_id uuid not null references decks(id) on delete cascade,
  result tournament_result_enum not null,
  created_at timestamp with time zone not null default now()
);

-- Indexes for performance
create index if not exists idx_matches_deck_a_id on matches(deck_a_id);
create index if not exists idx_matches_deck_b_id on matches(deck_b_id);
create index if not exists idx_matches_winner_id on matches(winner_id);
create index if not exists idx_tournament_results_deck_id on tournament_results(deck_id);
create unique index if not exists uniq_tournament_result_per_deck_per_tournament on tournament_results(tournament_id, deck_id);
