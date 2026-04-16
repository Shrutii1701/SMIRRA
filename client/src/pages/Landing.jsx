import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <main className="landing">
            <div className="landing-content">
                <div className="landing-badge">⚡ AI-Powered Practice</div>

                <h1 className="landing-title gradient-text">
                    SMIRRA
                </h1>

                <h2 className="landing-subtitle-main">
                    Master Your Next Technical Interview
                </h2>

                <p className="landing-subtitle">
                    Practice with AI-generated questions, get instant rubric-based
                    evaluation, and climb the ranks from Intern to Distinguished.
                </p>

                <div className="landing-actions">
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/topics')}
                        id="start-practice-btn"
                    >
                        🎯 Start Practicing
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/topics')}>
                        View Topics →
                    </button>
                </div>

                <div className="landing-features stagger-children">
                    <div className="glass-card feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>AI Evaluation</h3>
                        <p>
                            Two-layer scoring: AI rubric analysis plus deterministic game scoring
                            for fair, consistent feedback.
                        </p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">🏆</div>
                        <h3>Rank System</h3>
                        <p>
                            Climb from Intern to Distinguished. Build combos, earn time bonuses,
                            and watch your rank rise.
                        </p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Detailed Feedback</h3>
                        <p>
                            See scores for correctness, clarity, depth, and examples with
                            specific improvement suggestions.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
