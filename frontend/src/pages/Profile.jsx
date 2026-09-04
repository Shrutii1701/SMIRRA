import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Award, Flame, BarChart3, Target, TrendingUp, TrendingDown, BookOpen,
  Calendar, Gauge, Trophy, Zap, ChevronRight,
} from 'lucide-react';
import { evaluateAchievements } from '../data/achievements';

const XP_PER_LEVEL = 500;
const TOPICS = ['Technical', 'DSA', 'Java', 'Python', 'Web Dev', 'DBMS/SQL', 'HR', 'Mixed'];

export default function Profile() {
  const { user } = useUser();
  const history = user?.sessionsHistory || [];

  const count = history.length;
  const scores = history.map((s) => s.score || 0);
  const avgScore = count ? Math.round(scores.reduce((a, b) => a + b, 0) / count) : 0;
  const bestScore = count ? Math.max(...scores) : 0;

  // Level progress
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpInLevel;
  const levelPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  // Per-topic performance
  const topicStats = TOPICS.map((t) => {
    const s = history.filter((h) => h.topic === t);
    const avg = s.length ? Math.round(s.reduce((a, h) => a + (h.score || 0), 0) / s.length) : null;
    return { topic: t, count: s.length, avg };
  }).filter((t) => t.count > 0).sort((a, b) => b.avg - a.avg);

  const strengths = topicStats.slice(0, 3);
  const improvements = [...topicStats].reverse().slice(0, 3).filter((t) => t.avg < 80);

  // Difficulty distribution
  const diffCounts = ['Easy', 'Medium', 'Hard'].map((d) => ({
    d, n: history.filter((h) => h.difficulty === d).length,
  }));

  // Score trend (chronological, last 12)
  const trend = [...history].reverse().slice(-12).map((h) => h.score || 0);

  const unlocked = evaluateAchievements(user).filter((a) => a.unlocked).length;
  const memberSince = user?.registeredDate
    ? new Date(user.registeredDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  // Build a simple trend chart path
  const chartW = 600, chartH = 140, pad = 8;
  const trendPath = (() => {
    if (trend.length < 2) return null;
    const step = (chartW - pad * 2) / (trend.length - 1);
    const pts = trend.map((v, i) => [pad + i * step, chartH - pad - (v / 100) * (chartH - pad * 2)]);
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${chartH} L ${pts[0][0].toFixed(1)} ${chartH} Z`;
    return { line, area, pts };
  })();

  const initials = (() => {
    const n = (user?.name || 'U').trim().split(' ');
    return (n.length >= 2 ? n[0][0] + n[1][0] : n[0][0]).toUpperCase();
  })();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header / identity */}
      <div className="glass-card p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-cyan p-[2px] shadow-lg shadow-brand-primary/30 shrink-0">
          <div className="h-full w-full rounded-2xl bg-dark-card flex items-center justify-center text-2xl font-extrabold text-slate-100">
            {initials}
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-slate-100">{user?.name}</h1>
          <p className="text-sm text-slate-400 break-all">{user?.email}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 justify-center sm:justify-start">
            <Calendar className="h-3.5 w-3.5" /> Member since {memberSince}
          </p>
        </div>
        {/* Level progress */}
        <div className="w-full sm:w-56">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-200 flex items-center gap-1"><Award className="h-4 w-4 text-brand-cyan" /> Level {level}</span>
            <span className="text-slate-500">{xpToNext} XP to Lv.{level + 1}</span>
          </div>
          <div className="w-full bg-slate-900 border border-dark-border/20 rounded-full h-2.5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-cyan transition-all duration-500" style={{ width: `${levelPct}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 text-right">{xp.toLocaleString()} total XP</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Sessions', value: count, icon: BookOpen, c: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: BarChart3, c: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' },
          { label: 'Best Score', value: `${bestScore}%`, icon: Target, c: 'text-brand-secondary bg-brand-secondary/10 border-brand-secondary/20' },
          { label: 'Streak', value: `${user?.streak || 0}d`, icon: Flame, c: 'text-brand-secondary bg-brand-secondary/10 border-brand-secondary/20' },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="glass-card p-5 flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${m.c}`}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{m.label}</p>
                <p className="text-xl font-bold text-slate-100 mt-0.5">{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {count === 0 ? (
        <div className="glass-card p-16 text-center">
          <Gauge className="h-10 w-10 text-slate-600 mx-auto mb-4" />
          <h3 className="font-bold text-slate-300">No data to analyse yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">Complete a mock interview to unlock your performance analytics.</p>
          <Link to="/setup" className="btn-gradient text-xs py-2 px-6 rounded-full inline-flex items-center gap-2">
            Start Practicing <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score trend + difficulty */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-5 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-cyan" /> Score Trend
              </h3>
              {trendPath ? (
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-36" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" style={{ stopColor: 'rgb(var(--c-brand-cyan))' }} stopOpacity="0.35" />
                      <stop offset="100%" style={{ stopColor: 'rgb(var(--c-brand-cyan))' }} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={trendPath.area} fill="url(#trendFill)" />
                  <path d={trendPath.line} fill="none" style={{ stroke: 'rgb(var(--c-brand-cyan))' }} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                  {trendPath.pts.map((p, i) => (
                    <circle key={i} cx={p[0]} cy={p[1]} r="3" style={{ fill: 'rgb(var(--c-dark-bg))', stroke: 'rgb(var(--c-brand-cyan))' }} strokeWidth="2" />
                  ))}
                </svg>
              ) : (
                <p className="text-sm text-slate-500 py-8 text-center">Complete a few more sessions to see your trend.</p>
              )}
              <p className="text-xs text-slate-500 mt-2 text-center">Your last {trend.length} session scores (oldest → newest)</p>
            </div>

            {/* Per-topic mastery */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-5 flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-primary" /> Topic Mastery
              </h3>
              <div className="space-y-4">
                {topicStats.map((t) => (
                  <div key={t.topic}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-slate-300 font-medium">{t.topic} <span className="text-slate-500">· {t.count} session{t.count > 1 ? 's' : ''}</span></span>
                      <span className={`font-bold ${t.avg >= 80 ? 'text-brand-cyan' : t.avg >= 60 ? 'text-brand-primary' : 'text-brand-rose'}`}>{t.avg}%</span>
                    </div>
                    <div className="w-full bg-slate-900/60 border border-dark-border/20 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${t.avg >= 80 ? 'bg-gradient-to-r from-brand-cyan to-brand-primary' : t.avg >= 60 ? 'bg-gradient-to-r from-brand-primary to-brand-secondary' : 'bg-gradient-to-r from-brand-rose to-brand-secondary'}`} style={{ width: `${t.avg}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: strengths, improvements, difficulty, achievements */}
          <div className="space-y-8">
            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2"><TrendingUp className="h-4.5 w-4.5 text-brand-cyan" /> Strengths</h3>
              {strengths.length ? strengths.map((t) => (
                <div key={t.topic} className="flex justify-between items-center text-sm py-1.5 border-b border-dark-border/20 last:border-0">
                  <span className="text-slate-300">{t.topic}</span>
                  <span className="font-bold text-brand-cyan">{t.avg}%</span>
                </div>
              )) : <p className="text-xs text-slate-500">Keep practicing to reveal your strengths.</p>}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2"><TrendingDown className="h-4.5 w-4.5 text-brand-rose" /> Focus Areas</h3>
              {improvements.length ? improvements.map((t) => (
                <div key={t.topic} className="flex justify-between items-center text-sm py-1.5 border-b border-dark-border/20 last:border-0">
                  <span className="text-slate-300">{t.topic}</span>
                  <span className="font-bold text-brand-rose">{t.avg}%</span>
                </div>
              )) : <p className="text-xs text-slate-500">No weak spots — nicely balanced!</p>}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2"><Gauge className="h-4.5 w-4.5 text-brand-primary" /> Difficulty Mix</h3>
              <div className="space-y-2.5">
                {diffCounts.map((d) => (
                  <div key={d.d} className="flex items-center gap-3 text-sm">
                    <span className="w-16 text-slate-400">{d.d}</span>
                    <div className="flex-1 bg-slate-900/60 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-primary to-brand-cyan rounded-full" style={{ width: count ? `${(d.n / count) * 100}%` : '0%' }} />
                    </div>
                    <span className="w-6 text-right text-slate-300 font-semibold">{d.n}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/dashboard" className="glass-card p-4 flex items-center justify-between hover:border-brand-cyan/40 transition-colors group">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Trophy className="h-4.5 w-4.5 text-brand-secondary" /> {unlocked} achievements unlocked</span>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-brand-cyan group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
