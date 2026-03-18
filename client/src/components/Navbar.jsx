import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar({ gameState }) {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
        } else {
            document.documentElement.classList.remove('light-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

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

                <button 
                    className="theme-toggle" 
                    onClick={toggleTheme} 
                    aria-label="Toggle theme"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
        </nav>
    );
}
