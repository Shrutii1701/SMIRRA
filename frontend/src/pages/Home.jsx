import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles, Award, Zap, Shield, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl text-center z-10 animate-fade-in">
        {/* Sparkle Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/5 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          AI Mock Interview Practice
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 font-sans text-gradient">
          Master Your Next Tech Interview <br />
          <span className="text-gradient-rainbow">With AI-Powered Practice</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Practice technical, DSA, language-specific, and behavioral interviews with real-time feedback, grading metrics, and difficulty pacing tailored just for you.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link to="/setup" className="btn-gradient flex items-center justify-center gap-2 text-base px-8 py-4">
            <Play className="h-5 w-5 fill-current" />
            Start Free Practice Session
          </Link>
          <Link to="/dashboard" className="btn-outline flex items-center justify-center gap-2 text-base px-8 py-4">
            View My Dashboard
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-4">
          <div className="glass-card glass-card-hover p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Gemini Pro Evaluation</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Receive grading across accuracy, completeness, clarity, relevance, and overall communication.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Adaptive Difficulty</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Questions adapt based on how well you respond. Strive for combo multiplier bonuses!
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 mb-4">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Detailed Scorecards</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pinpoint code errors, identify missing conceptual blocks, and track your daily preparation streaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
