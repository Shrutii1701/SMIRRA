import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { getDailyChallenge, isDailyChallengeDone } from '../data/dailyChallenge';

/**
 * Prominent "Daily Challenge" banner on the dashboard. Same topic/difficulty for
 * everyone each day; launches a normal interview session with those settings.
 */
export default function DailyChallengeCard({ user }) {
  const navigate = useNavigate();
  const challenge = getDailyChallenge();
  const done = isDailyChallengeDone(user, challenge);

  const start = () => {
    navigate('/interview', {
      state: {
        topic: challenge.topic,
        difficulty: challenge.difficulty,
        questionType: challenge.questionType,
        persona: challenge.persona,
      },
    });
  };

  return (
    <div className="glass-card p-6 mb-8 relative overflow-hidden border-brand-secondary/25 bg-gradient-to-r from-brand-secondary/[0.06] via-transparent to-brand-cyan/[0.04]">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="h-28 w-28 text-brand-secondary" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-secondary mb-2">
            <CalendarClock className="h-4 w-4" />
            Daily Challenge · {challenge.todayLabel}
          </span>
          <h3 className="text-xl font-extrabold text-slate-100">
            {challenge.topic} <span className="text-slate-500">·</span> {challenge.difficulty}
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-lg">
            A fresh {challenge.difficulty.toLowerCase()} {challenge.topic} set, the same for everyone today. Complete it to defend your streak and climb the leaderboard.
          </p>
        </div>

        {done ? (
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/5 text-brand-cyan font-semibold text-sm whitespace-nowrap">
            <CheckCircle2 className="h-5 w-5" />
            Completed today
          </div>
        ) : (
          <button onClick={start} className="btn-gradient inline-flex items-center gap-2 whitespace-nowrap">
            Take the Challenge
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </div>
  );
}
