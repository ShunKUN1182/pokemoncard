import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import RankingTable from "../../components/RankingTable/RankingTable";
import type { Deck } from "../../types/database";
import "./RankingPage.scss";

interface RankingDeck extends Deck {
    wins: number;
    losses: number;
    winRateLabel: string;
    rank: number;
}

function formatWinRate(wins: number, losses: number) {
    const total = wins + losses;
    if (!total) return "-";
    return `${((wins / total) * 100).toFixed(1)}%`;
}

function RankingPage() {
    const [decks, setDecks] = useState<RankingDeck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDeckRanking() {
            setLoading(true);
            setError("");

            const { data: deckData, error: deckError } = await supabase.from("decks").select("*");
            if (deckError || !deckData) {
                setError("ランキングの取得に失敗しました。時間を置いて再度お試しください。");
                setLoading(false);
                return;
            }

            const { data: matchData, error: matchError } = await supabase
                .from("matches")
                .select("winner_id, deck_a_id, deck_b_id");
            if (matchError || !matchData) {
                setError("ランキングの取得中に問題が発生しました。");
                setLoading(false);
                return;
            }

            const deckMap = new Map<string, { wins: number; losses: number }>();
            deckData.forEach((deck) => deckMap.set(deck.id, { wins: 0, losses: 0 }));

            matchData.forEach((match) => {
                if (!match.deck_a_id || !match.deck_b_id || !match.winner_id) return;
                const loserId =
                    match.winner_id === match.deck_a_id ? match.deck_b_id : match.deck_a_id;
                const winnerStats = deckMap.get(match.winner_id);
                const loserStats = deckMap.get(loserId);
                if (winnerStats) winnerStats.wins += 1;
                if (loserStats) loserStats.losses += 1;
            });

            const sortedDecks = deckData
                .map((deck) => {
                    const stats = deckMap.get(deck.id) ?? { wins: 0, losses: 0 };
                    return {
                        ...deck,
                        wins: stats.wins,
                        losses: stats.losses,
                        winRateLabel: formatWinRate(stats.wins, stats.losses),
                    };
                })
                .sort((a, b) => b.pcp - a.pcp || b.wins - a.wins);

            setDecks(sortedDecks.map((deck, index) => ({ ...deck, rank: index + 1 })));
            setLoading(false);
        }

        loadDeckRanking();
    }, []);

    return (
        <section>
            <h1 className="page-title">PCP Ranking System</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && <RankingTable decks={decks} />}
        </section>
    );
}

export default RankingPage;
