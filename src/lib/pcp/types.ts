export type MatchType = keyof typeof import("./constants").MATCH_MULTIPLIERS;

export type MatchResult = "win" | "loss";

export type TournamentResult =
    | keyof typeof import("./constants").PCL_RESULT_BONUSES
    | "qualifier_eliminated"
    | "repechage_eliminated"
    | "top8"
    | "not_participated";

export interface CalculatePCPChangeParams {
    myPCP: number;
    opponentPCP: number;
    result: MatchResult;
    matchType: MatchType;
}

export interface CalculatePCPChangeResult {
    change: number;
    isUnderdog: boolean;
    baseChange: number;
    advantageBonus: number;
    multiplier: number;
}
