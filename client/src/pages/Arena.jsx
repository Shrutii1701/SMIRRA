import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluateAnswer } from '../api/interviewApi';
import './Arena.css';

export default function Arena({ interview, gameState, onEvaluationComplete }) {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [seconds, setSeconds] = useState(0);
    const [evaluating, setEvaluating] = useState(false);
    const [error, setError] = useState(null);
    const timerRef = useRef(null);
    const textareaRef = useRef(null);

    // Redirect if no interview data
    useEffect(() => {
        if (!interview) navigate('/topics');
    }, [interview, navigate]);

    // Timer — counts up from 0
    useEffect(() => {
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(timerRef.current);
    }, [currentIndex]);

    // Reset timer and answer when moving to next question
    useEffect(() => {
        setSeconds(0);
        setAnswer('');
        setError(null);
        textareaRef.current?.focus();
    }, [currentIndex]);

    const formatTime = useCallback((s) => {
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }, []);

    const getTimerClass = () => {
        if (seconds >= 120) return 'danger';
        if (seconds >= 90) return 'warning';
        return '';
    };

    if (!interview) return null;

    const question = interview.questions[currentIndex];
    const isLastQuestion = currentIndex >= interview.questions.length - 1;

    const handleSubmit = async () => {
        if (answer.trim().length < 10) {
            setError('Answer must be at least 10 characters.');
            return;
        }

        clearInterval(timerRef.current);
        setEvaluating(true);
        setError(null);

        try {
            const result = await evaluateAnswer({
                question: question.question,
                answer: answer.trim(),
                expectedConcepts: question.expectedConcepts,
                timeSpent: seconds,
                combo: gameState.combo,
                cumulativeScore: gameState.cumulativeScore,
            });

            // Pass the result up to App for state updates
            onEvaluationComplete(result, question, answer.trim(), seconds);

            if (isLastQuestion) {
                navigate('/results');
            } else {
                setCurrentIndex((i) => i + 1);
                setEvaluating(false);
            }
        } catch (err) {
            setError(err.message);
            setEvaluating(false);
            // Restart timer on error so they can retry
            timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        }
    };

    const handleSkip = () => {
        clearInterval(timerRef.current);
        // Record a skip as zero scores
        onEvaluationComplete(
            {
                aiAnalysis: { scores: { correctness: 0, clarity: 0, depth: 0, examples: 0 }, feedback: { strengths: [], improvements: ['Question was skipped'], missedConcepts: question.expectedConcepts, overallComment: 'This question was skipped.' } },
                scoring: { finalScore: 0, breakdown: { baseScore: 0, timeBonus: 0, comboMultiplier: 1, aiScores: { correctness: 0, clarity: 0, depth: 0, examples: 0 } }, gamification: { isGoodAnswer: false, comboStreak: 0, cumulativeScore: gameState.cumulativeScore, rank: gameState.rank } },
            },
            question,
            '(skipped)',
            seconds
        );

        if (isLastQuestion) {
            navigate('/results');
        } else {
            setCurrentIndex((i) => i + 1);
        }
    };

    if (evaluating) {
        return (
            <main className="arena-page">
                <div className="container arena-container">
                    <div className="glass-card evaluating-overlay">
                        <div className="spinner"></div>
                        <p>🤖 AI is evaluating your answer...</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Analyzing correctness, clarity, depth, and examples
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="arena-page">
            <div className="container arena-container">
                {/* Progress bar */}
                <div className="arena-progress">
                    <div className="progress-bar-track">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${((currentIndex + 1) / interview.questions.length) * 100}%` }}
                        />
                    </div>
                    <span className="progress-text">
                        {currentIndex + 1} / {interview.questions.length}
                    </span>
                </div>

                {/* Question */}
                <div className="glass-card question-card" key={currentIndex}>
                    <div className="question-meta">
                        <span className="badge">{question.type}</span>
                        <span className="badge">{interview.difficulty}</span>
                    </div>
                    <p className="question-text">{question.question}</p>
                </div>

                {/* Timer & Combo */}
                <div className="arena-timer">
                    <div className={`timer-display ${getTimerClass()}`}>
                        ⏱️ {formatTime(seconds)}
                    </div>
                    {gameState.combo > 0 && (
                        <div className="combo-display">
                            <span className="combo-fire">🔥</span>
                            {gameState.combo}x Combo
                        </div>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <div className="glass-card" style={{ padding: 'var(--space-md)', color: 'var(--danger)', marginBottom: 'var(--space-md)', textAlign: 'center' }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Answer textarea */}
                <div className="answer-section">
                    <textarea
                        ref={textareaRef}
                        className="answer-textarea"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here... Be thorough — cover concepts, provide examples, and explain your reasoning."
                        id="answer-input"
                    />
                    <div className="answer-footer">
                        <span className="char-count">{answer.length} characters</span>
                        <div className="arena-actions">
                            <button className="btn-secondary" onClick={handleSkip} id="skip-btn">
                                Skip →
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSubmit}
                                disabled={answer.trim().length < 10}
                                id="submit-answer-btn"
                            >
                                Submit Answer ✓
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
