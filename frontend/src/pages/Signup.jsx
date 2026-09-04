import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { register } = useUser();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim()) return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setSubmitting(true);
    setError('');
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/setup');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[calc(100vh-8rem)]">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-widest text-gradient mb-2">SMIRRA</h1>
          <p className="text-sm text-slate-400">Create your account to start practicing.</p>
        </div>

        <div className="glass-card p-8 border border-dark-border/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-xs bg-brand-rose/10 border border-brand-rose/20 text-brand-rose rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-dark-border/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-cyan/80 focus:ring-1 focus:ring-brand-cyan/40 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-dark-border/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-cyan/80 focus:ring-1 focus:ring-brand-cyan/40 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-dark-border/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-cyan/80 focus:ring-1 focus:ring-brand-cyan/40 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-dark-border/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-cyan/80 focus:ring-1 focus:ring-brand-cyan/40 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-gradient flex items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating account…' : 'Create Account'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-cyan font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
