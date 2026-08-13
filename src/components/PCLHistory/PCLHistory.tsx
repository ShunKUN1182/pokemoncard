import type { TournamentResultRecord } from "../../types/database";
import { TOURNAMENT_RESULT_LABELS } from "../../lib/pcp/constants";
import "./PCLHistory.scss";

interface PCLHistoryProps {
    tournamentResults: Array<{
        tournamentName: string;
        tournamentNumber: number;
        result: string;
    }>;
}

function PCLHistory({ tournamentResults }: PCLHistoryProps) {
    if (!tournamentResults.length) {
        return <p>まだPCLの戦歴がありません。</p>;
    }

    return (
        <div className="pcl-history card">
            <h2 className="section-title">PCL戦歴</h2>
            <div className="pcl-list">
                {tournamentResults.map((entry) => (
                    <article key={`${entry.tournamentName}-${entry.result}`} className="pcl-entry">
                        <div className="pcl-event">{`第${entry.tournamentNumber}回PCL`}</div>
                        <div className="pcl-result">
                            {TOURNAMENT_RESULT_LABELS[entry.result] ?? entry.result}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

export default PCLHistory;
