import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchQuestion, submitAnswer } from '../services/api';
import { AlertCircle, Clock, Zap, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  // Route state fallback if user direct-typed url
  const { topic, difficulty, questionType } = location.state || {
    topic: 'DSA',
    difficulty: 'Medium',
    questionType: 'Mixed',
  };

  const [currentIdx, setCurrentIdx] = useState(0); // 3 questions total (0, 1, 2)
  const [questions, setQuestions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [timer, setTimer] = useState(90);
  const [isGrading, setIsGrading] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [combo, setCombo] = useState(0);
  const [gradedResponses, setGradedResponses] = useState([]);
  const [error, setError] = useState('');

  const timerRef = useRef(null);

  // Fetch the first question on mount
  useEffect(() => {
    loadNextQuestion([]);
  }, []);

  // Timer Countdown Logic
  useEffect(() => {
    if (isLoadingQuestion || isGrading) return;

    // Reset clock to 90 seconds whenever a new question is loaded
    setTimer(90);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isLoadingQuestion, currentIdx]);

  const loadNextQuestion = async (pastQuestions) => {
    setIsLoadingQuestion(true);
    setError('');
    try {
      const qText = await fetchQuestion(topic, difficulty, questionType, pastQuestions);
      setQuestions((prev) => [...prev, qText]);
      setAnswer('');
      setIsLoadingQuestion(false);
    } catch (err) {
      setError(err.message || 'Failed to generate question. Verify Gemini API key.');
      setIsLoadingQuestion(false);
    }
  };

  const handleAutoSubmit = () => {
    // When timer expires, submit answer automatically
    handleSubmit(true);
  };

  const handleSubmit = async (isAuto = false) => {
    // Clear timer
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = 90 - timer;
    setIsGrading(true);
    setError('');

    const currentQuestion = questions[currentIdx];
    const userAnswer = answer.trim();

    try {
      const response = await submitAnswer({
        question: currentQuestion,
        answer: userAnswer,
        topic,
        difficulty,
        timeTaken,
        combo,
      });

      // Save this graded response
      const updatedGraded = [...gradedResponses, {
        question: currentQuestion,
        answer: userAnswer,
        timeTaken,
        ...response // contains evaluation, timeBonus, comboBonus, totalScore, nextCombo
      }];
      setGradedResponses(updatedGraded);
      
      // Update combo counter for next round
      setCombo(response.nextCombo);

      // Advance interview
      const nextIdx = currentIdx + 1;
      if (nextIdx < 3) {
        setCurrentIdx(nextIdx);
        // Load next question, passing all gathered question texts so they aren't repeated
        const pastQuestions = [...questions];
        await loadNextQuestion(pastQuestions);
        setIsGrading(false);
      } else {
        // Complete the mock round and navigate to results screen
        navigate('/results', {
          state: {
            topic,
            difficulty,
            gradedResponses: updatedGraded,
          }
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit response.');
      setIsGrading(false);
      // Restart timer if submission failed
      setTimer(90);
    }
  };

  // Get color for countdown timer
  const getTimerColor = () => {
    if (timer > 45) return 'text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5';
    if (timer > 20) return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
    return 'text-brand-rose border-brand-rose/20 bg-brand-rose/5 animate-pulse';
  };

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center animate-fade-in">
        <div className="glass-card p-8 border-brand-rose/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-rose/10 text-brand-rose border border-brand-rose/25 mx-auto mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Interview Session Error</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/setup')} className="btn-outline text-xs px-6">
              Adjust Settings
            </button>
            <button onClick={() => loadNextQuestion(questions)} className="btn-gradient text-xs px-6">
              Retry Generation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative min-h-[calc(100vh-8rem)] flex flex-col justify-between">
      
      {/* Loading overlay for AI Grading */}
      {isGrading && (
        <div className="absolute inset-0 bg-dark-bg/85 backdrop-blur-md z-40 rounded-2xl flex flex-col items-center justify-center text-center p-6 animate-fade-in">
          <div className="relative flex items-center justify-center mb-6">
            <div className="h-16 w-16 rounded-full border-t-2 border-brand-cyan animate-spin"></div>
            <Sparkles className="absolute h-6 w-6 text-brand-cyan glow-text-cyan animate-pulse" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-100 tracking-wide font-sans">
            AI Evaluating Performance
          </h3>
          <p className="text-slate-400 text-sm max-w-sm mt-2 leading-relaxed">
            Grading technical accuracy, answer completeness, explanation clarity, and calculating time bonuses.
          </p>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full">
        {/* Top Header stats */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded text-xs border font-semibold border-dark-border bg-slate-900 text-slate-300">
              {topic} • {difficulty}
            </span>
            <h2 className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1.5">
              Question {currentIdx + 1} of 3
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Combo Status */}
            {combo > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-orange-500/20 bg-orange-500/5 text-orange-500 text-xs font-bold">
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>{combo}x Combo</span>
              </div>
            )}

            {/* Countdown clock */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-mono font-bold ${getTimerColor()}`}>
              <Clock className="h-4 w-4" />
              <span>0:{timer < 10 ? `0${timer}` : timer}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-900 border border-dark-border/20 rounded-full h-1.5 mb-8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-cyan transition-all duration-300"
            style={{ width: `${((currentIdx + (isLoadingQuestion ? 0 : 0.5)) / 3) * 100}%` }}
          ></div>
        </div>

        {/* Question Area */}
        <div className="glass-card p-6 sm:p-8 mb-6 relative border-brand-primary/20 overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="h-24 w-24 text-brand-primary" />
          </div>

          {isLoadingQuestion ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-brand-cyan mb-3" />
              <p className="text-xs tracking-wider">Antigravity AI is formulating question...</p>
            </div>
          ) : (
            <div>
              <p className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed font-sans select-none">
                {questions[currentIdx]}
              </p>
            </div>
          )}
        </div>

        {/* Answer Area */}
        {!isLoadingQuestion && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="answer" className="font-semibold text-slate-400 uppercase tracking-wider">
                Your Answer Response
              </label>
              <span className="text-slate-500 font-mono">{answer.length} chars</span>
            </div>
            <textarea
              id="answer"
              rows={8}
              placeholder="Type your structured explanation or code block response here. Be as thorough as possible..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isGrading}
              className="block w-full px-4 py-3 bg-slate-950/50 border border-dark-border/60 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-cyan/80 focus:ring-1 focus:ring-brand-cyan/40 text-sm sm:text-base leading-relaxed transition-all resize-none shadow-inner"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isLoadingQuestion && (
        <div className="flex justify-end gap-4 mt-8 border-t border-dark-border/20 pt-6">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isGrading || !answer.trim()}
            className={`btn-gradient inline-flex items-center gap-2 ${
              !answer.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Submit Answer & Next
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      )}
    </div>
  );
}
