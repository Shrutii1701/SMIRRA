// ─── App.jsx ────────────────────────────────────────────────────────
// Root component — owns all shared state and routes.
//
// STATE ARCHITECTURE:
//   gameState  → cumulative score, combo streak, current rank
//   interview  → current topic, difficulty, and generated questions
//   results    → array of per-question evaluation results
//
// WHY lift state here instead of using a state manager?
// For an app this size, prop drilling is simpler, more explicit,
// and easier to debug. If we add auth/profiles later we can
// introduce Context or Zustand without rewriting.
// ─────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import TopicSelection from './pages/TopicSelection';
import Arena from './pages/Arena';
import Results from './pages/Results';
import Sparkles from './components/Sparkles';

const INITIAL_GAME_STATE = {
  cumulativeScore: 0,
  combo: 0,
  rank: null,
};

export default function App() {
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [interview, setInterview] = useState(null);
  const [sessionResults, setSessionResults] = useState([]);

  // Called by TopicSelection when questions are generated
  const handleStartInterview = useCallback((data) => {
    setInterview(data);
    setSessionResults([]);
  }, []);

  // Called by Arena after each answer is evaluated
  const handleEvaluationComplete = useCallback((result, question, answer, timeSpent) => {
    // Append to session results — include the question text for the results page
    setSessionResults((prev) => [...prev, { ...result, question: question.question, answer, timeSpent }]);

    // Update game state from the scoring engine's gamification output
    const gamification = result.scoring.gamification;
    setGameState({
      cumulativeScore: gamification.cumulativeScore,
      combo: gamification.comboStreak,
      rank: gamification.rank,
    });
  }, []);

  // Reset everything for a new session
  const handleReset = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
    setInterview(null);
    setSessionResults([]);
  }, []);

  return (
    <>
      <Sparkles />
      <Navbar gameState={gameState} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/topics"
          element={<TopicSelection onStartInterview={handleStartInterview} />}
        />
        <Route
          path="/arena"
          element={
            <Arena
              interview={interview}
              gameState={gameState}
              onEvaluationComplete={handleEvaluationComplete}
            />
          }
        />
        <Route
          path="/results"
          element={
            <Results
              sessionResults={sessionResults}
              gameState={gameState}
              onReset={handleReset}
            />
          }
        />
      </Routes>
    </>
  );
}
