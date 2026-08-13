import { NavLink } from "react-router-dom";
import "./Header.scss";

function Header() {
    return (
        <header className="app-header">
            <div className="header-inner">
                <div className="brand">
                    <strong>PCP Ranking System</strong>
                    <p>Deck ranking powered by match results</p>
                </div>
                <nav className="header-nav">
                    <NavLink to="/" end>
                        Ranking
                    </NavLink>
                    <NavLink to="/matches/new">Register Match</NavLink>
                    <NavLink to="/tournament-results/new">Register Results</NavLink>
                </nav>
            </div>
        </header>
    );
}

export default Header;
