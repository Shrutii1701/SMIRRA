import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTopics, generateQuestions } from '../api/interviewApi';
import './TopicSelection.css';

export default function TopicSelection({ onStartInterview }) {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [difficulties, setDifficulties] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch available topics from API on mount
    useEffect(() => {
        fetchTopics()
            .then((data) => {
                setTopics(data.topics);
                setDifficulties(data.difficulties);
            })
            .catch((err) => setError(err.message));
    }, []);

    const handleStart = async () => {
        if (!selectedTopic) return;
        setLoading(true);
        setError(null);

        try {
            const data = await generateQuestions(selectedTopic.id, selectedDifficulty, 5);
            onStartInterview({
                topic: selectedTopic,
                difficulty: selectedDifficulty,
                questions: data.questions,
            });
            navigate('/arena');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="topics-page">
            <div className="container">
                <div className="topics-header">
                    <h1>Choose Your <span className="gradient-text">Battle Arena</span></h1>
                    <p>Select a topic and difficulty to begin your interview practice session.</p>
                </div>

                {error && (
                    <div className="glass-card" style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--danger)', marginBottom: 'var(--space-lg)' }}>
                        ⚠️ {error}
                    </div>
                )}

                <div className="topics-grid stagger-children">
                    {topics.map((topic) => (
                        <div
                            key={topic.id}
                            className={`glass-card topic-card ${selectedTopic?.id === topic.id ? 'selected' : ''}`}
                            onClick={() => setSelectedTopic(topic)}
                            id={`topic-${topic.id}`}
                        >
                            <div className="topic-card-header">
                                <div className="topic-icon">{topic.icon}</div>
                                <h3>{topic.name}</h3>
                            </div>
                            <div className="topic-subtopics">
                                {topic.subtopics.map((sub) => (
                                    <span key={sub}>{sub}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedTopic && (
                    <>
                        <div className="difficulty-section">
                            <h2>Select Difficulty</h2>
                            <div className="difficulty-options">
                                {difficulties.map((d) => (
                                    <button
                                        key={d}
                                        className={`difficulty-btn ${selectedDifficulty === d ? 'active' : ''}`}
                                        onClick={() => setSelectedDifficulty(d)}
                                        id={`difficulty-${d}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="topics-start">
                            <button
                                className="btn-primary"
                                onClick={handleStart}
                                disabled={loading}
                                id="begin-interview-btn"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                                        Generating Questions...
                                    </>
                                ) : (
                                    <>⚔️ Begin Interview — {selectedTopic.name} ({selectedDifficulty})</>
                                )}
                            </button>
                        </div>
                    </>
                )}

                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>AI is crafting your questions...</p>
                    </div>
                )}
            </div>
        </main>
    );
}
