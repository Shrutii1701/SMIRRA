import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Award, ShieldAlert, CheckCircle, ChevronDown, BookOpen, LayoutDashboard, Sparkles, Clock, Zap } from 'lucide-react';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addSession } = useUser();
  const effectRan = useRef(false);

  const { topic, difficulty, gradedResponses } = location.state || {};

  // Redirect if accessed directly without data
  useEffect(() => {
    if (!gradedResponses || gradedResponses.length === 0) {
      navigate('/dashboard');
    }
  }, [gradedResponses, navigate]);

  // Save session once on mount
  useEffect(() => {
    if (gradedResponses && gradedResponses.length > 0 && !effectRan.current) {
      effectRan.current = true;

      // Calculate averages and bonuses
      const count = gradedResponses.length;
      const avgScore = Math.round(gradedResponses.reduce((sum, r) => sum + r.totalScore, 0) / count);
      const totalTimeBonus = gradedResponses.reduce((sum, r) => sum + r.timeBonus, 0);
      const totalComboBonus = gradedResponses.reduce((sum, r) => sum + r.comboBonus, 0);

      // Collect feedback summary
      const topFeedback = gradedResponses[0]?.evaluation?.feedback || '';

      addSession({
        topic,
        difficulty,
        score: avgScore,
        timeBonus: totalTimeBonus,
        comboBonus: totalComboBonus,
        evaluation: {
          feedbackSummary: topFeedback,
          itemsCount: count,
        }
      });
    }
  }, [gradedResponses]);

  if (!gradedResponses || gradedResponses.length === 0) {
    return null;
  }

  const count = gradedResponses.length;
  const avgOverall = Math.round(gradedResponses.reduce((sum, r) => sum + r.evaluation.overallScore, 0) / count);
  const avgAccuracy = Math.round(gradedResponses.reduce((sum, r) => sum + r.evaluation.technicalAccuracy, 0) / count);
  const avgCompleteness = Math.round(gradedResponses.reduce((sum, r) => sum + r.evaluation.completeness, 0) / count);
  const avgClarity = Math.round(gradedResponses.reduce((sum, r) => sum + r.evaluation.clarity, 0) / count);
  const avgRelevance = Math.round(gradedResponses.reduce((sum, r) => sum + r.evaluation.relevance, 0) / count);
  const avgComm = Math.round(gradedResponses.reduce((sum, r) => sum + r.evaluation.communication, 0) / count);

  const totalTimeBonus = gradedResponses.reduce((sum, r) => sum + r.timeBonus, 0);
  const totalComboBonus = gradedResponses.reduce((sum, r) => sum + r.comboBonus, 0);
  const xpGained = avgOverall + totalTimeBonus + totalComboBonus;

  const dimensionStats = [
    { label: 'Technical Accuracy', score: avgAccuracy, color: 'from-brand-primary to-indigo-600' },
    { label: 'Completeness', score: avgCompleteness, color: 'from-brand-secondary to-purple-600' },
    { label: 'Clarity & Logic', score: avgClarity, color: 'from-brand-cyan to-blue-500' },
    { label: 'Relevance', score: avgRelevance, color: 'from-teal-400 to-emerald-500' },
    { label: 'Communication Style', score: avgComm, color: 'from-orange-400 to-amber-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header Summary Card */}
      <div className="glass-card p-8 mb-8 border-brand-cyan/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Award className="h-44 w-44 text-brand-cyan" />
        </div>

        <div className="text-center md:text-left z-10">
          <span className="inline-block px-3 py-1 rounded-full border border-brand-cyan/30 bg-brand-cyan/5 text-brand-cyan text-xs font-bold uppercase tracking-wider mb-3">
            Mock Practice Report
          </span>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
            Evaluation & Feedback Scorecard
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl">
            Topic: <span className="font-semibold text-slate-200">{topic}</span> • Difficulty: <span className="font-semibold text-slate-200">{difficulty}</span>.
            Your answers have been graded across core professional dimensions.
          </p>
        </div>

        {/* Experience Gain Circular Badge */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.02] border border-dark-border/40 min-w-[200px] text-center z-10 shadow-lg">
          <span className="text-4xl font-extrabold text-gradient-rainbow">+{xpGained}</span>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">XP Points Gained</span>
          <div className="flex gap-3 text-[10px] text-slate-500 mt-3 border-t border-dark-border/20 pt-2 w-full justify-center">
            <span className="flex items-center gap-0.5"><Clock className="h-3 w-3 text-brand-cyan" /> +{totalTimeBonus} time</span>
            <span className="flex items-center gap-0.5"><Zap className="h-3 w-3 text-orange-500" /> +{totalComboBonus} combo</span>
          </div>
        </div>
      </div>

      {/* Grid: Stats vs Question Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Dimensions Score Columns */}
        <div className="glass-card p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-200 mb-6 border-b border-dark-border/20 pb-2 flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-cyan" />
              Dimension Ratings
            </h3>
            <div className="space-y-6">
              {dimensionStats.map((dim) => (
                <div key={dim.label}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span className="text-slate-300 font-medium">{dim.label}</span>
                    <span className="font-bold text-slate-100">{dim.score}%</span>
                  </div>
                  <div className="w-full bg-slate-900 border border-dark-border/20 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${dim.color}`}
                      style={{ width: `${dim.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl text-center">
            <p className="text-xs text-slate-400">Overall AI Grade Average</p>
            <p className="text-3xl font-extrabold text-brand-cyan mt-1">{avgOverall}%</p>
          </div>
        </div>

        {/* Question by Question Accordion breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-200 pl-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-brand-cyan" />
            Interview Question Walkthrough
          </h3>

          {gradedResponses.map((res, index) => (
            <div key={index} className="glass-card p-6 border-dark-border/40 hover:border-dark-border/80 transition-colors">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <span className="text-xs text-brand-cyan font-bold tracking-wider">QUESTION {index + 1} OF 3</span>
                  <h4 className="text-base font-semibold text-slate-100 mt-1">{res.question}</h4>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-brand-cyan">{res.evaluation.overallScore}%</span>
                  <p className="text-[10px] text-slate-500">Graded Score</p>
                </div>
              </div>

              {/* User Answer block */}
              <div className="bg-slate-950/40 border border-dark-border/20 rounded-xl p-3.5 mb-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">Your Response</p>
                <p className="text-xs sm:text-sm text-slate-300 italic whitespace-pre-wrap">
                  {res.answer || '(No answer text provided)'}
                </p>
              </div>

              {/* AI Feedback block */}
              <div className="border-t border-dark-border/20 pt-4 space-y-3">
                <div>
                  <p className="text-xs text-brand-cyan font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Evaluation & Guidance
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                    {res.evaluation.feedback}
                  </p>
                </div>

                {/* Missing concepts tags */}
                {res.evaluation.missingConcepts?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">Missing Concepts & Terms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {res.evaluation.missingConcepts.map((concept, cIdx) => (
                        <span
                          key={cIdx}
                          className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded border border-brand-rose/25 bg-brand-rose/5 text-brand-rose"
                        >
                          <ShieldAlert className="h-3 w-3" />
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation CTAs */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 border-t border-dark-border/20 pt-8">
        <Link to="/setup" className="btn-gradient flex items-center justify-center gap-2 text-sm px-8 py-3">
          <BookOpen className="h-4.5 w-4.5" />
          Practice Again
        </Link>
        <Link to="/dashboard" className="btn-outline flex items-center justify-center gap-2 text-sm px-8 py-3">
          <LayoutDashboard className="h-4.5 w-4.5" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
