import { MATCH_MULTIPLIERS } from "./constants";
import type { CalculatePCPChangeParams, CalculatePCPChangeResult } from "./types";

export function calculatePCPChange({
    myPCP,
    opponentPCP,
    result,
    matchType,
}: CalculatePCPChangeParams): CalculatePCPChangeResult {
    const multiplier = MATCH_MULTIPLIERS[matchType] ?? 1;
    const isUnderdog = opponentPCP - myPCP >= 100;
    const baseChange = result === "win" ? 20 * multiplier : -20 * multiplier;
    const advantageBonus = isUnderdog ? 10 : 0;
    const change = baseChange + advantageBonus;

    return {
        change,
        isUnderdog,
        baseChange,
        advantageBonus,
        multiplier,
    };
}

export function applyPCPChange(currentPCP: number, change: number): number {
    return Math.max(0, currentPCP + change);
}
