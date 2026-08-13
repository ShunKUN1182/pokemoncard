import { describe, expect, it } from "vitest";
import { calculatePCPChange } from "./calculatePCP";

describe("calculatePCPChange", () => {
    it("returns +20 for a normal exhibition win with equal PCP", () => {
        const result = calculatePCPChange({
            myPCP: 1500,
            opponentPCP: 1500,
            result: "win",
            matchType: "exhibition",
        });
        expect(result.change).toBe(20);
    });

    it("returns -20 for a normal exhibition loss with equal PCP", () => {
        const result = calculatePCPChange({
            myPCP: 1500,
            opponentPCP: 1500,
            result: "loss",
            matchType: "exhibition",
        });
        expect(result.change).toBe(-20);
    });

    it("returns +30 for an upset exhibition win", () => {
        const result = calculatePCPChange({
            myPCP: 1500,
            opponentPCP: 1600,
            result: "win",
            matchType: "exhibition",
        });
        expect(result.change).toBe(30);
        expect(result.isUnderdog).toBe(true);
    });

    it("returns -10 for an upset exhibition loss", () => {
        const result = calculatePCPChange({
            myPCP: 1500,
            opponentPCP: 1600,
            result: "loss",
            matchType: "exhibition",
        });
        expect(result.change).toBe(-10);
        expect(result.isUnderdog).toBe(true);
    });

    it("returns +20 for a win when opponent PCP difference is 99", () => {
        const result = calculatePCPChange({
            myPCP: 1500,
            opponentPCP: 1599,
            result: "win",
            matchType: "exhibition",
        });
        expect(result.change).toBe(20);
        expect(result.isUnderdog).toBe(false);
    });

    it("returns +30 for a win when opponent PCP difference is 100", () => {
        const result = calculatePCPChange({
            myPCP: 1500,
            opponentPCP: 1600,
            result: "win",
            matchType: "exhibition",
        });
        expect(result.change).toBe(30);
        expect(result.isUnderdog).toBe(true);
    });

    it("returns +100 for a PCL final win with equal PCP", () => {
        const result = calculatePCPChange({
            myPCP: 1500,
            opponentPCP: 1500,
            result: "win",
            matchType: "pcl_final",
        });
        expect(result.change).toBe(100);
    });

    it("returns +110 for an upset PCL final win", () => {
        const result = calculatePCPChange({
            myPCP: 1500,
            opponentPCP: 1600,
            result: "win",
            matchType: "pcl_final",
        });
        expect(result.change).toBe(110);
    });

    it("returns -90 for an upset PCL final loss", () => {
        const result = calculatePCPChange({
            myPCP: 1500,
            opponentPCP: 1600,
            result: "loss",
            matchType: "pcl_final",
        });
        expect(result.change).toBe(-90);
    });
});
