import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar({ gameState }) {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const location = useLocation();
    const isHome = location.pathname === '/';

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
                <div className="navbar-left">
                    {gameState && (
                        <div className="navbar-stats">
                            <div className="navbar-stat">
                                Score: <span className="value">{gameState.cumulativeScore}</span>
                            </div>
                            <div className="navbar-stat">
                                🔥 <span className="value">{gameState.combo}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="navbar-center">
                    {!isHome && (
                        <Link to="/" className="navbar-brand">
                            SMIRRA
                        </Link>
                    )}
                </div>

                <div className="navbar-right">
                    <button 
                        className="theme-toggle" 
                        onClick={toggleTheme} 
                        aria-label="Toggle theme"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>
        </nav>
    );
}
