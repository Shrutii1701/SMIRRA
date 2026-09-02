import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { fetchLeaderboard } from '../services/api';
import { Trophy, Crown, Medal, Flame, Award, Loader2, AlertCircle, BookOpen } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useUser();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchLeaderboard(20);
        if (active) setRows(data);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load leaderboard.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Medal colour for the top three ranks.
  const rankBadge = (rank) => {
    if (rank === 1) return { icon: Crown, cls: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10' };
    if (rank === 2) return { icon: Medal, cls: 'text-slate-300 border-slate-400/40 bg-slate-400/10' };
    if (rank === 3) return { icon: Medal, cls: 'text-amber-600 border-amber-600/40 bg-amber-600/10' };
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 font-sans tracking-tight flex items-center gap-3">
            <Trophy className="h-7 w-7 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-slate-400 mt-1">Top practitioners ranked by total experience earned.</p>
        </div>
        <Link to="/setup" className="btn-gradient inline-flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5" />
          Climb the Ranks
        </Link>
      </div>

      {loading ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-brand-cyan mb-3" />
          <p className="text-sm">Loading rankings…</p>
        </div>
      ) : error ? (
        <div className="glass-card p-10 text-center border-brand-rose/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-rose/10 text-brand-rose border border-brand-rose/25 mx-auto mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Trophy className="h-10 w-10 text-slate-600 mx-auto mb-4" />
          <h3 className="font-bold text-slate-300">No ranked players yet</h3>
          <p className="text-xs text-slate-500 mt-1">Complete a practice session to claim the top spot!</p>
        </div>
      ) : (
        <div className="glass-card p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400 border-b border-dark-border/40">
                <tr>
                  <th className="pb-3 pl-2 w-16">Rank</th>
                  <th className="pb-3">Player</th>
                  <th className="pb-3 text-center">Level</th>
                  <th className="pb-3 text-center hidden sm:table-cell">Streak</th>
                  <th className="pb-3 text-center hidden sm:table-cell">Sessions</th>
                  <th className="pb-3 text-right pr-2">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/20">
                {rows.map((r) => {
                  const isMe = user?.id && r.id === user.id;
                  const badge = rankBadge(r.rank);
                  const BadgeIcon = badge?.icon;
                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors ${isMe ? 'bg-brand-cyan/[0.06]' : 'hover:bg-white/5'}`}
                    >
                      <td className="py-3.5 pl-2">
                        {badge ? (
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${badge.cls}`}>
                            <BadgeIcon className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="inline-flex h-7 w-7 items-center justify-center text-slate-500 font-bold font-mono">
                            {r.rank}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span className={`font-semibold ${isMe ? 'text-brand-cyan' : 'text-slate-200'}`}>
                          {r.name}
                        </span>
                        {isMe && (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-brand-cyan/80 border border-brand-cyan/30 rounded px-1.5 py-0.5">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <Award className="h-3.5 w-3.5 text-brand-primary" />
                          {r.level}
                        </span>
                      </td>
                      <td className="py-3.5 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <Flame className="h-3.5 w-3.5 text-orange-500" />
                          {r.streak}
                        </span>
                      </td>
                      <td className="py-3.5 text-center hidden sm:table-cell text-slate-400">{r.sessions}</td>
                      <td className="py-3.5 text-right pr-2 font-bold text-brand-cyan">{r.xp.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
