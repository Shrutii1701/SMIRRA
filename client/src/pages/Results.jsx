import { useNavigate } from 'react-router-dom';
import './Results.css';

export default function Results({ sessionResults, gameState, onReset }) {
    const navigate = useNavigate();

    if (!sessionResults || sessionResults.length === 0) {
        navigate('/topics');
        return null;
    }

    // Compute session totals
    const totalScore = sessionResults.reduce((sum, r) => sum + r.scoring.finalScore, 0);
    const avgScore = totalScore / sessionResults.length;
    const bestScore = Math.max(...sessionResults.map((r) => r.scoring.finalScore));
    const goodAnswers = sessionResults.filter((r) => r.scoring.gamification.isGoodAnswer).length;

    const getScoreClass = (score) => {
        if (score >= 7) return 'good';
        if (score >= 4) return 'okay';
        return 'bad';
    };

    const getRubricClass = (score) => {
        if (score >= 7) return 'high';
        if (score >= 4) return 'medium';
        return 'low';
    };

    const handleNewSession = () => {
        onReset();
        navigate('/topics');
    };

    const currentRank = gameState.rank;

    return (
        <main className="results-page">
            <div className="container results-container">
                {/* Header */}
                <div className="results-header">
                    <h1>Session <span className="gradient-text">Complete</span></h1>
                    <p>Here's how you performed across {sessionResults.length} questions</p>
                </div>

                {/* Score Summary */}
                <div className="glass-card score-summary">
                    <div className={`final-score gradient-text`}>
                        {Math.round(totalScore * 10) / 10}
                    </div>
                    <div className="rank-display">
                        <span className="rank-emoji">{currentRank?.current?.emoji}</span>
                        {currentRank?.current?.name}
                    </div>

                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{Math.round(avgScore * 10) / 10}</div>
                            <div className="stat-label">Avg Score</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{Math.round(bestScore * 10) / 10}</div>
                            <div className="stat-label">Best</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{goodAnswers}/{sessionResults.length}</div>
                            <div className="stat-label">Good</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{gameState.combo}🔥</div>
                            <div className="stat-label">Streak</div>
                        </div>
                    </div>

                    {/* Rank progress */}
                    {currentRank?.next && (
                        <div className="rank-progress-section">
                            <div className="rank-progress-label">
                                <span>{currentRank.current.emoji} {currentRank.current.name}</span>
                                <span>{currentRank.next.emoji} {currentRank.next.name}</span>
                            </div>
                            <div className="rank-progress-bar">
                                <div
                                    className="rank-progress-fill"
                                    style={{ width: `${currentRank.progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Individual question results */}
                <div className="question-results stagger-children">
                    {sessionResults.map((result, i) => {
                        const scores = result.aiAnalysis.scores;
                        const feedback = result.aiAnalysis.feedback;
                        const finalScore = result.scoring.finalScore;

                        return (
                            <div key={i} className="glass-card question-result-card">
                                <div className="qr-header">
                                    <div className="qr-question">
                                        <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Q{i + 1}.</span>
                                        {result.question}
                                    </div>
                                    <div className={`qr-score ${getScoreClass(finalScore)}`}>
                                        {Math.round(finalScore * 10) / 10}
                                    </div>
                                </div>

                                {/* Rubric bars */}
                                <div className="rubric-bars">
                                    {Object.entries(scores).map(([key, val]) => (
                                        <div className="rubric-item" key={key}>
                                            <div className="rubric-name">{key}</div>
                                            <div className="rubric-bar">
                                                <div
                                                    className={`rubric-bar-fill ${getRubricClass(val)}`}
                                                    style={{ width: `${val * 10}%` }}
                                                />
                                            </div>
                                            <div className="rubric-value">{val}/10</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Feedback */}
                                <div className="qr-feedback">
                                    <p>{feedback.overallComment}</p>
                                    <div className="feedback-tags">
                                        {feedback.strengths.map((s, j) => (
                                            <span key={`s-${j}`} className="feedback-tag strength">✓ {s}</span>
                                        ))}
                                        {feedback.improvements.map((imp, j) => (
                                            <span key={`i-${j}`} className="feedback-tag improvement">↑ {imp}</span>
                                        ))}
                                        {feedback.missedConcepts.map((m, j) => (
                                            <span key={`m-${j}`} className="feedback-tag missed">✗ {m}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="results-actions">
                    <button className="btn-secondary" onClick={() => navigate('/')}>
                        🏠 Home
                    </button>
                    <button className="btn-primary" onClick={handleNewSession}>
                        🔄 New Session
                    </button>
                </div>
            </div>
        </main>
    );
}
