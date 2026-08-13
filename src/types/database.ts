export interface Deck {
    id: string;
    name: string;
    pcp: number;
    wins?: number;
    losses?: number;
    created_at: string;
    updated_at: string;
}

export interface Tournament {
    id: string;
    name: string;
    number: number;
    created_at: string;
}

export interface MatchRecord {
    id: string;
    deck_a_id: string;
    deck_b_id: string;
    winner_id: string;
    match_type: string;
    tournament_id: string | null;
    round: string | null;
    deck_a_pcp_before: number;
    deck_b_pcp_before: number;
    deck_a_pcp_change: number;
    deck_b_pcp_change: number;
    created_at: string;
}

export interface TournamentResultRecord {
    id: string;
    tournament_id: string;
    deck_id: string;
    result: string;
    created_at: string;
}
