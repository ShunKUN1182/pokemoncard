import type { Deck } from "../../types/database";
import { Link } from "react-router-dom";
import "./RankingTable.scss";

interface RankingTableProps {
    decks: Array<Deck & { wins: number; losses: number; winRateLabel: string; rank: number }>;
}

function RankingTable({ decks }: RankingTableProps) {
    return (
        <div className="ranking-card card">
            <h2 className="section-title">ランキング</h2>
            <div className="ranking-table">
                <div className="ranking-row ranking-header">
                    <div>Rank</div>
                    <div>Deck</div>
                    <div>PCP</div>
                    <div>Wins</div>
                    <div>Losses</div>
                    <div>Win Rate</div>
                </div>
                {decks.map((deck) => (
                    <Link
                        key={deck.id}
                        to={`/decks/${deck.id}`}
                        className="ranking-row ranking-item"
                    >
                        <div>#{deck.rank}</div>
                        <div>{deck.name}</div>
                        <div>{deck.pcp}</div>
                        <div>{deck.wins}W</div>
                        <div>{deck.losses}L</div>
                        <div>{deck.winRateLabel}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default RankingTable;
