import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { TOURNAMENT_RESULT_LABELS } from "../../lib/pcp/constants";
import type { Deck, Tournament } from "../../types/database";
import type { TournamentResult } from "../../lib/pcp/types";
import "./TournamentResultRegisterPage.scss";

const tournamentResultKeys = Object.keys(TOURNAMENT_RESULT_LABELS) as Array<
    keyof typeof TOURNAMENT_RESULT_LABELS
>;

function TournamentResultRegisterPage() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [tournamentId, setTournamentId] = useState("");
    const [resultsByDeck, setResultsByDeck] = useState<Record<string, TournamentResult>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            setError("");

            const { data: deckData, error: deckError } = await supabase
                .from("decks")
                .select("*")
                .order("name");
            const { data: tournamentData, error: tournamentError } = await supabase
                .from("tournaments")
                .select("*")
                .order("number", { ascending: true });

            if (deckError || !deckData || tournamentError || !tournamentData) {
                setError("初期データの取得に失敗しました。もう一度お試しください。");
                setLoading(false);
                return;
            }

            setDecks(deckData);
            setTournaments(tournamentData);
            setResultsByDeck(
                Object.fromEntries(
                    deckData.map((deck) => [deck.id, "not_participated" as TournamentResult]),
                ),
            );
            setLoading(false);
        }

        fetchInitialData();
    }, []);

    const tournamentName = useMemo(() => {
        return tournaments.find((tournament) => tournament.id === tournamentId)?.name || "";
    }, [tournaments, tournamentId]);

    const handleResultChange = (deckId: string, value: TournamentResult) => {
        setResultsByDeck((current) => ({ ...current, [deckId]: value }));
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!tournamentId) {
            setError("大会を選択してください。");
            return;
        }

        setSubmitting(true);

        const payload = decks.map((deck) => ({
            tournament_id: tournamentId,
            deck_id: deck.id,
            result: resultsByDeck[deck.id] ?? "not_participated",
        }));

        const { error: insertError } = await supabase
            .from("tournament_results")
            .upsert(payload, { onConflict: "tournament_id,deck_id" });

        if (insertError) {
            setError(`大会結果の登録に失敗しました。${insertError.message}`);
            setSubmitting(false);
            return;
        }

        setSuccess(`第${tournamentName}回PCLの大会結果を登録しました。`);
        setSubmitting(false);
    }

    return (
        <section>
            <h1 className="page-title">大会結果登録</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            {!loading && (
                <form className="result-form card" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">大会</label>
                        <select
                            className="select"
                            value={tournamentId}
                            onChange={(event) => setTournamentId(event.target.value)}
                        >
                            <option value="">大会を選択</option>
                            {tournaments.map((tournament) => (
                                <option key={tournament.id} value={tournament.id}>
                                    {`第${tournament.number}回PCL`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="table-wrapper">
                        <div className="result-table-header">
                            <span>デッキ</span>
                            <span>結果</span>
                        </div>
                        {decks.map((deck) => (
                            <div key={deck.id} className="result-table-row">
                                <div>{deck.name}</div>
                                <div>
                                    <select
                                        className="select"
                                        value={resultsByDeck[deck.id] ?? "not_participated"}
                                        onChange={(event) =>
                                            handleResultChange(
                                                deck.id,
                                                event.target.value as TournamentResult,
                                            )
                                        }
                                    >
                                        {tournamentResultKeys.map((resultKey) => (
                                            <option key={resultKey} value={resultKey}>
                                                {TOURNAMENT_RESULT_LABELS[resultKey]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="button" disabled={submitting}>
                        {submitting ? "登録中..." : "大会結果を登録"}
                    </button>
                </form>
            )}
        </section>
    );
}

export default TournamentResultRegisterPage;
