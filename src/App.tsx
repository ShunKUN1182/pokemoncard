import { Route, Routes, Navigate } from "react-router-dom";
import Header from "./components/Header/Header";
import RankingPage from "./pages/RankingPage/RankingPage";
import DeckDetailPage from "./pages/DeckDetailPage/DeckDetailPage";
import MatchRegisterPage from "./pages/MatchRegisterPage/MatchRegisterPage";
import TournamentResultRegisterPage from "./pages/TournamentResultRegisterPage/TournamentResultRegisterPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

function App() {
    return (
        <div className="app-shell">
            <Header />
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<RankingPage />} />
                    <Route path="/ranking" element={<Navigate to="/" replace />} />
                    <Route path="/decks/:deckId" element={<DeckDetailPage />} />
                    <Route path="/matches/new" element={<MatchRegisterPage />} />
                    <Route
                        path="/tournament-results/new"
                        element={<TournamentResultRegisterPage />}
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
