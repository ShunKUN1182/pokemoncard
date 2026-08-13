import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";
import PCLHistory from "../../components/PCLHistory/PCLHistory";
import type { Deck, TournamentResultRecord, Tournament } from "../../types/database";
import "./DeckDetailPage.scss";

interface DeckStats {
    wins: number;
    losses: number;
    rank: number;
    winRateLabel: string;
}

function formatWinRate(wins: number, losses: number) {
    const total = wins + losses;
    if (!total) return "-";
    return `${((wins / total) * 100).toFixed(1)}%`;
}

function DeckDetailPage() {
    const { deckId } = useParams<{ deckId: string }>();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [stats, setStats] = useState<DeckStats | null>(null);
    const [tournamentResults, setTournamentResults] = useState<
        Array<{ tournamentName: string; tournamentNumber: number; result: string }>
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!deckId) return;

        async function loadDeckDetail() {
            setLoading(true);
            setError("");

            const { data: deckData, error: deckError } = await supabase
                .from("decks")
                .select("*")
                .eq("id", deckId)
                .single();
            if (deckError || !deckData) {
                setError("デッキが見つかりませんでした。");
                setLoading(false);
                return;
            }

            const { data: allDecks, error: allDecksError } = await supabase
                .from("decks")
                .select("*");
            if (allDecksError || !allDecks) {
                setError("ランキング情報の取得に失敗しました。");
                setLoading(false);
                return;
            }

            const { data: matchData, error: matchError } = await supabase
                .from("matches")
                .select("winner_id, deck_a_id, deck_b_id");
            if (matchError || !matchData) {
                setError("試合履歴の取得に失敗しました。");
                setLoading(false);
                return;
            }

            const deckMap = new Map<string, { wins: number; losses: number }>();
            allDecks.forEach((entry) => deckMap.set(entry.id, { wins: 0, losses: 0 }));
            matchData.forEach((match) => {
                if (!match.deck_a_id || !match.deck_b_id || !match.winner_id) return;
                const loserId =
                    match.winner_id === match.deck_a_id ? match.deck_b_id : match.deck_a_id;
                const winnerStats = deckMap.get(match.winner_id);
                const loserStats = deckMap.get(loserId);
                if (winnerStats) winnerStats.wins += 1;
                if (loserStats) loserStats.losses += 1;
            });

            const sortedDecks = [...allDecks].sort(
                (a, b) => b.pcp - a.pcp || b.name.localeCompare(a.name),
            );
            const rank = sortedDecks.findIndex((entry) => entry.id === deckData.id) + 1;
            const deckStats = deckMap.get(deckData.id) ?? { wins: 0, losses: 0 };
            const deckWins = deckStats.wins;
            const deckLosses = deckStats.losses;

            const { data: resultsData, error: resultsError } = await supabase
                .from("tournament_results")
                .select("*, tournament:tournament_id(name, number)")
                .eq("deck_id", deckData.id)
                .order("created_at", { ascending: false });

            if (resultsError || !resultsData) {
                setError("PCL戦歴の取得に失敗しました。");
                setLoading(false);
                return;
            }

            const filtered = resultsData
                .map((item) => ({
                    tournamentName: item.tournament.name,
                    tournamentNumber: item.tournament.number,
                    result: item.result,
                }))
                .sort((a, b) => b.tournamentNumber - a.tournamentNumber);

            setDeck(deckData);
            setStats({
                wins: deckWins,
                losses: deckLosses,
                rank,
                winRateLabel: formatWinRate(deckWins, deckLosses),
            });
            setTournamentResults(filtered);
            setLoading(false);
        }

        loadDeckDetail();
    }, [deckId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!deck || !stats) return <p className="error-message">デッキ情報を読み込めませんでした。</p>;

    return (
        <section>
            <div className="detail-header card">
                <div>
                    <p className="small-label">#{stats.rank}</p>
                    <h1 className="page-title">{deck.name}</h1>
                </div>
                <div className="score-block">
                    <p className="score-label">現在PCP</p>
                    <p className="score-value">{deck.pcp}</p>
                </div>
            </div>
            <div className="detail-summary card">
                <div>
                    <p className="small-label">勝利数</p>
                    <p>{stats.wins}</p>
                </div>
                <div>
                    <p className="small-label">敗北数</p>
                    <p>{stats.losses}</p>
                </div>
                <div>
                    <p className="small-label">勝率</p>
                    <p>{stats.winRateLabel}</p>
                </div>
            </div>
            <PCLHistory tournamentResults={tournamentResults} />
            <div className="link-back">
                <Link to="/" className="button secondary">
                    ランキングに戻る
                </Link>
            </div>
        </section>
    );
}

export default DeckDetailPage;
