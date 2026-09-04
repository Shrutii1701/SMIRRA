import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { LayoutDashboard, Play, LogOut, Award, Flame, Trophy, Sparkle, UserRound } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/setup', label: 'Practice', icon: Play },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leaderboard', label: 'Ranks', icon: Trophy },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <nav className="sticky top-3 z-50 px-3 sm:px-4">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-3 rounded-full border border-dark-border/50 bg-dark-card/40 backdrop-blur-xl shadow-lg shadow-black/30 pl-3 pr-2 py-2">

        {/* Logo mark + wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0 pl-1">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary/40 to-brand-cyan/20 border border-white/10 group-hover:scale-105 transition-transform">
            <Sparkle className="h-4 w-4 text-brand-cyan fill-brand-cyan/80 glow-text-cyan" />
          </span>
          <span className="text-lg font-extrabold tracking-[0.2em] text-gradient font-sans">SMIRRA</span>
        </Link>

        {/* Center nav — floating pill segment */}
        {user && (
          <div className="hidden md:flex items-center gap-1 rounded-full bg-black/25 border border-white/5 p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-brand-primary/50 to-brand-cyan/25 text-slate-100 border border-white/10 shadow-inner'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-brand-cyan' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right — profile / CTA */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-full p-1 hover:bg-white/5 transition-colors focus:outline-none"
            >
              <div className="hidden sm:flex flex-col items-end text-right leading-tight mr-0.5">
                <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                <span className="text-[10px] text-brand-cyan flex items-center gap-1 justify-end">
                  <Award className="h-3 w-3" /> Lv. {user.level}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-primary to-brand-cyan p-[1.5px] shadow-md shadow-brand-primary/30">
                <div className="h-full w-full rounded-full bg-dark-card flex items-center justify-center text-slate-100 font-bold text-sm">
                  {getInitials(user.name)}
                </div>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 glass-card p-4 border border-dark-border shadow-2xl animate-fade-in rounded-2xl">
                <div className="border-b border-dark-border/40 pb-3 mb-3">
                  <p className="font-bold text-slate-100 text-sm leading-tight">{user.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 break-all">{user.email}</p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-brand-secondary" /> Practice Streak
                    </span>
                    <span className="font-bold text-brand-secondary">{user.streak} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-brand-cyan" /> Total Experience
                    </span>
                    <span className="font-bold text-brand-cyan">{user.xp} XP</span>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-brand-cyan bg-white/5 hover:bg-brand-cyan/10 border border-dark-border/40 hover:border-brand-cyan/25 transition-all"
                >
                  <UserRound className="h-4 w-4" /> View Profile & Analytics
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-brand-rose hover:bg-brand-rose/10 border border-transparent hover:border-brand-rose/25 transition-all"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/signup" className="btn-gradient text-xs py-2 px-5 rounded-full">
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
}
