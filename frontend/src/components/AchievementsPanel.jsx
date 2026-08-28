import React from 'react';
import { Lock, Trophy } from 'lucide-react';
import { evaluateAchievements } from '../data/achievements';

/**
 * Grid of achievement badges. Unlocked badges are highlighted by tier; locked
 * ones are dimmed and show a progress bar toward their goal.
 */
export default function AchievementsPanel({ user }) {
  const achievements = evaluateAchievements(user);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6 border-b border-dark-border/20 pb-3">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Achievements
        </h3>
        <span className="text-xs font-semibold text-slate-400">
          <span className="text-brand-cyan font-bold">{unlockedCount}</span> / {achievements.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {achievements.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.id}
              title={a.description}
              className={`relative rounded-2xl p-4 border text-center transition-all duration-200 ${
                a.unlocked
                  ? `${a.tierMeta.ring} bg-gradient-to-b ${a.tierMeta.glow} hover:-translate-y-0.5`
                  : 'border-dark-border/30 bg-slate-950/30'
              }`}
            >
              {/* Tier tag on unlocked */}
              {a.unlocked && (
                <span className={`absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider ${a.tierMeta.text}`}>
                  {a.tierMeta.label}
                </span>
              )}

              <div
                className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border ${
                  a.unlocked
                    ? `${a.tierMeta.ring} ${a.tierMeta.text} bg-white/5`
                    : 'border-dark-border/40 text-slate-600 bg-white/[0.02]'
                }`}
              >
                {a.unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
              </div>

              <h4 className={`text-xs font-bold leading-tight ${a.unlocked ? 'text-slate-100' : 'text-slate-500'}`}>
                {a.title}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-2">{a.description}</p>

              {/* Progress bar for locked achievements */}
              {!a.unlocked && (
                <div className="mt-2.5">
                  <div className="w-full bg-slate-900 border border-dark-border/20 rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-cyan transition-all duration-500"
                      style={{ width: `${a.progressPct}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1 inline-block font-mono">
                    {a.progress.current}/{a.progress.target}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
