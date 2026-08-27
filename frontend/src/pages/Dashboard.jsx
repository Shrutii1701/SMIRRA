import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Award, Calendar, ChevronRight, Flame, BarChart3, Clock, BookOpen, User } from 'lucide-react';

export default function Dashboard() {
  const { user } = useUser();

  const history = user?.sessionsHistory || [];

  // Calculate stats from user history
  const completedCount = history.length;
  
  // Calculate average score
  const avgScore = completedCount > 0 
    ? Math.round(history.reduce((sum, s) => sum + s.score, 0) / completedCount) 
    : 0;

  const stats = [
    { label: 'Practice Level', value: `Lv. ${user?.level || 1}`, icon: Award, color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' },
    { label: 'Active Streak', value: `${user?.streak || 0} Days`, icon: Flame, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
    { label: 'Total Experience', value: `${user?.xp || 0} XP`, icon: BarChart3, color: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20' },
    { label: 'Practices Done', value: `${completedCount} sessions`, icon: Clock, color: 'text-brand-secondary bg-brand-secondary/10 border-brand-secondary/20' },
  ];

  // Calculate topic competencies from history
  const topicsList = ['Technical', 'DSA', 'Java', 'Python', 'Web Dev', 'DBMS/SQL', 'HR', 'Mixed'];
  const competencies = topicsList.map(topicName => {
    const topicSessions = history.filter(s => s.topic === topicName);
    const score = topicSessions.length > 0
      ? Math.round(topicSessions.reduce((sum, s) => sum + s.score, 0) / topicSessions.length)
      : null; // null represents not practiced yet
    return { topic: topicName, score };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
            Developer Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.name}. Ready to level up your competency?</p>
        </div>
        <Link to="/setup" className="btn-gradient inline-flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5" />
          Start New Practice
        </Link>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Competencies Breakdown */}
        <div className="glass-card p-6 lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-primary" />
            Competency Strengths
          </h3>
          <div className="space-y-4 flex-1">
            {competencies.map((comp) => {
              const hasPracticed = comp.score !== null;
              const displayScore = hasPracticed ? comp.score : 0;
              return (
                <div key={comp.topic}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-slate-300 font-medium">{comp.topic}</span>
                    <span className={`font-semibold ${
                      !hasPracticed 
                        ? 'text-slate-500' 
                        : displayScore >= 80 
                        ? 'text-brand-cyan' 
                        : displayScore >= 60 
                        ? 'text-brand-primary' 
                        : 'text-brand-rose'
                    }`}>
                      {hasPracticed ? `${displayScore}%` : 'Unranked'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/60 border border-dark-border/20 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        !hasPracticed
                          ? 'bg-slate-800'
                          : displayScore >= 80 
                          ? 'bg-gradient-to-r from-brand-cyan to-indigo-500' 
                          : displayScore >= 60 
                          ? 'bg-gradient-to-r from-brand-primary to-brand-secondary' 
                          : 'bg-gradient-to-r from-brand-rose to-red-400'
                      }`}
                      style={{ width: `${hasPracticed ? displayScore : 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice History */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-cyan" />
              Practice History
            </h3>
            
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-xl bg-slate-900 border border-dark-border/40 text-slate-500 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-300 text-sm">No Mock Sessions Completed</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
                  You haven't run any mock practices yet. Launch your first practice arena to view real-time grading reports!
                </p>
                <Link to="/setup" className="btn-gradient text-xs py-2 px-6">
                  Start Practice Session
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase tracking-wider text-slate-400 border-b border-dark-border/40">
                    <tr>
                      <th className="pb-3 pl-2">Session Date</th>
                      <th className="pb-3">Topic</th>
                      <th className="pb-3">Difficulty</th>
                      <th className="pb-3">Practice Score</th>
                      <th className="pb-3 text-right pr-2">XP Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/20">
                    {history.map((session) => (
                      <tr key={session.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 pl-2 text-slate-400">{session.date}</td>
                        <td className="py-3.5 font-semibold text-slate-200">{session.topic}</td>
                        <td className="py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs border font-medium ${
                            session.difficulty === 'Hard'
                              ? 'border-brand-rose/20 bg-brand-rose/10 text-brand-rose'
                              : session.difficulty === 'Medium'
                              ? 'border-brand-primary/20 bg-brand-primary/10 text-brand-primary'
                              : 'border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan'
                          }`}>
                            {session.difficulty}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold">
                          <span className={session.score >= 80 ? 'text-brand-cyan' : session.score >= 60 ? 'text-slate-200' : 'text-brand-rose'}>
                            {session.score}/100
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-2 font-semibold text-brand-cyan">
                          +{session.xpEarned} XP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {history.length > 0 && (
            <div className="border-t border-dark-border/20 pt-4 mt-6 text-center text-xs text-slate-500">
              Average Performance Rating: <span className="font-bold text-brand-cyan">{avgScore}%</span> across {completedCount} sessions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
