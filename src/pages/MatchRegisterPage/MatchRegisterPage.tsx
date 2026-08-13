import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { calculatePCPChange } from "../../lib/pcp/calculatePCP";
import { MATCH_TYPE_LABELS } from "../../lib/pcp/constants";
import type { Deck, Tournament } from "../../types/database";
import "./MatchRegisterPage.scss";

const matchTypes = [
    "exhibition",
    "pcl_qualifier",
    "pcl_repechage",
    "pcl_quarterfinal",
    "pcl_semifinal",
    "pcl_final",
] as const;

function MatchRegisterPage() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [deckA, setDeckA] = useState("");
    const [deckB, setDeckB] = useState("");
    const [winnerId, setWinnerId] = useState("");
    const [matchType, setMatchType] = useState<(typeof matchTypes)[number]>("exhibition");
    const [tournamentId, setTournamentId] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            const { data: deckData, error: deckError } = await supabase
                .from("decks")
                .select("*")
                .order("name");
            const { data: tournamentData, error: tournamentError } = await supabase
                .from("tournaments")
                .select("*")
                .order("number", { ascending: true });

            if (deckError || !deckData || tournamentError || !tournamentData) {
                setError("初期データの取得に失敗しました。");
            } else {
                setDecks(deckData);
                setTournaments(tournamentData);
            }

            setLoading(false);
        }

        fetchInitialData();
    }, []);

    const deckAInfo = useMemo(
        () => decks.find((deck) => deck.id === deckA) ?? null,
        [decks, deckA],
    );
    const deckBInfo = useMemo(
        () => decks.find((deck) => deck.id === deckB) ?? null,
        [decks, deckB],
    );
    const previewWinner = winnerId === deckA ? deckAInfo : winnerId === deckB ? deckBInfo : null;

    const previewChange = useMemo(() => {
        if (!deckAInfo || !deckBInfo || !winnerId) return null;
        const outcomeA = winnerId === deckA ? "win" : "loss";
        const outcomeB = winnerId === deckB ? "win" : "loss";
        const resultA = calculatePCPChange({
            myPCP: deckAInfo.pcp,
            opponentPCP: deckBInfo.pcp,
            result: outcomeA,
            matchType,
        });
        const resultB = calculatePCPChange({
            myPCP: deckBInfo.pcp,
            opponentPCP: deckAInfo.pcp,
            result: outcomeB,
            matchType,
        });
        return {
            deckA: resultA.change,
            deckB: resultB.change,
        };
    }, [deckAInfo, deckBInfo, winnerId, matchType]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!deckA || !deckB || !winnerId || !matchType) {
            setError("すべての必須項目を入力してください。");
            return;
        }

        if (deckA === deckB) {
            setError("同じデッキを選択することはできません。");
            return;
        }

        if (matchType !== "exhibition" && !tournamentId) {
            setError("PCL試合では大会を選択してください。");
            return;
        }

        setSubmitting(true);

        const { data: refreshedA, error: aError } = await supabase
            .from("decks")
            .select("*")
            .eq("id", deckA)
            .single();
        const { data: refreshedB, error: bError } = await supabase
            .from("decks")
            .select("*")
            .eq("id", deckB)
            .single();

        if (aError || bError || !refreshedA || !refreshedB) {
            setError("デッキ情報の取得に失敗しました。");
            setSubmitting(false);
            return;
        }

        const deckAChange = calculatePCPChange({
            myPCP: refreshedA.pcp,
            opponentPCP: refreshedB.pcp,
            result: winnerId === deckA ? "win" : "loss",
            matchType,
        });
        const deckBChange = calculatePCPChange({
            myPCP: refreshedB.pcp,
            opponentPCP: refreshedA.pcp,
            result: winnerId === deckB ? "win" : "loss",
            matchType,
        });

        const updateA = {
            pcp: Math.max(0, refreshedA.pcp + deckAChange.change),
        };
        const updateB = {
            pcp: Math.max(0, refreshedB.pcp + deckBChange.change),
        };

        const matchPayload = {
            deck_a_id: refreshedA.id,
            deck_b_id: refreshedB.id,
            winner_id: winnerId,
            match_type: matchType,
            tournament_id: matchType === "exhibition" ? null : tournamentId,
            round:
                matchType === "pcl_quarterfinal"
                    ? "quarterfinal"
                    : matchType === "pcl_semifinal"
                      ? "semifinal"
                      : matchType === "pcl_final"
                        ? "final"
                        : null,
            deck_a_pcp_before: refreshedA.pcp,
            deck_b_pcp_before: refreshedB.pcp,
            deck_a_pcp_change: deckAChange.change,
            deck_b_pcp_change: deckBChange.change,
        };

        const { error: insertError } = await supabase.from("matches").insert([matchPayload]);
        const { data: updatedA, error: updateAError } = await supabase
            .from("decks")
            .update(updateA)
            .eq("id", refreshedA.id)
            .select();
        const { data: updatedB, error: updateBError } = await supabase
            .from("decks")
            .update(updateB)
            .eq("id", refreshedB.id)
            .select();

        const firstError = insertError || updateAError || updateBError;
        const updateFailed =
            !updatedA || updatedA.length === 0 || !updatedB || updatedB.length === 0;

        if (firstError || updateFailed) {
            const message = firstError ? firstError.message : "デッキのPCP更新に失敗しました。";
            setError(`試合結果の登録に失敗しました。${message}`);
            setSubmitting(false);
            return;
        }

        setSuccess("試合結果を登録しました。ランキングに反映されます。");
        setDeckA("");
        setDeckB("");
        setWinnerId("");
        setTournamentId("");
        setMatchType("exhibition");
        setSubmitting(false);
    }

    return (
        <section>
            <h1 className="page-title">試合結果登録</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            {!loading && (
                <form className="match-form card" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">大会</label>
                        <select
                            className="select"
                            value={tournamentId}
                            onChange={(event) => setTournamentId(event.target.value)}
                            disabled={matchType === "exhibition"}
                        >
                            <option value="">大会を選択</option>
                            {tournaments.map((tournament) => (
                                <option key={tournament.id} value={tournament.id}>
                                    {`第${tournament.number}回PCL`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">試合種別</label>
                        <select
                            className="select"
                            value={matchType}
                            onChange={(event) =>
                                setMatchType(event.target.value as (typeof matchTypes)[number])
                            }
                        >
                            {matchTypes.map((type) => (
                                <option key={type} value={type}>
                                    {MATCH_TYPE_LABELS[type]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="label">デッキA</label>
                            <select
                                className="select"
                                value={deckA}
                                onChange={(event) => setDeckA(event.target.value)}
                            >
                                <option value="">デッキを選択</option>
                                {decks.map((deck) => (
                                    <option key={deck.id} value={deck.id}>
                                        {deck.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="label">デッキB</label>
                            <select
                                className="select"
                                value={deckB}
                                onChange={(event) => setDeckB(event.target.value)}
                            >
                                <option value="">デッキを選択</option>
                                {decks.map((deck) => (
                                    <option key={deck.id} value={deck.id}>
                                        {deck.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">勝者</label>
                        <select
                            className="select"
                            value={winnerId}
                            onChange={(event) => setWinnerId(event.target.value)}
                        >
                            <option value="">勝者を選択</option>
                            {deckAInfo && <option value={deckAInfo.id}>{deckAInfo.name}</option>}
                            {deckBInfo && <option value={deckBInfo.id}>{deckBInfo.name}</option>}
                        </select>
                    </div>

                    <div className="preview card preview-panel">
                        <h2>プレビュー</h2>
                        {deckAInfo && deckBInfo ? (
                            <div className="preview-grid">
                                <div className="preview-card">
                                    <p className="preview-title">{deckAInfo.name}</p>
                                    <p>{deckAInfo.pcp} PCP</p>
                                    {previewChange && (
                                        <p className="preview-change">
                                            {previewChange.deckA >= 0
                                                ? `+${previewChange.deckA}`
                                                : previewChange.deckA}
                                        </p>
                                    )}
                                </div>
                                <div className="preview-card">
                                    <p className="preview-title">{deckBInfo.name}</p>
                                    <p>{deckBInfo.pcp} PCP</p>
                                    {previewChange && (
                                        <p className="preview-change">
                                            {previewChange.deckB >= 0
                                                ? `+${previewChange.deckB}`
                                                : previewChange.deckB}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p>デッキAとデッキBを選択すると、現在のPCPと予想PCPが表示されます。</p>
                        )}
                    </div>

                    <button type="submit" className="button" disabled={submitting}>
                        {submitting ? "登録中..." : "試合結果を登録"}
                    </button>
                </form>
            )}
        </section>
    );
}

export default MatchRegisterPage;
