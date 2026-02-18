import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ gameState }) {
    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    <span>🎯</span>
                    Interview Arena
                </Link>

                {gameState && (
                    <div className="navbar-stats">
                        <div className="navbar-stat">
                            Score: <span className="value">{gameState.cumulativeScore}</span>
                        </div>
                        <div className="navbar-stat">
                            🔥 <span className="value">{gameState.combo}</span>
                        </div>
                        {gameState.rank && (
                            <div className="navbar-rank">
                                {gameState.rank.current.emoji} {gameState.rank.current.name}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
