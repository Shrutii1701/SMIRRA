import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { LayoutDashboard, Play, LogOut, Award, Flame, Trophy } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
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
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/setup', label: 'Start Practice', icon: Play },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  // Get initials for profile badge
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-dark-border/40 bg-dark-bg/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo - NO BRAND ICON/SYMBOL AS REQUESTED */}
          <Link to="/" className="flex items-center gap-1 group">
            <span className="text-xl font-extrabold tracking-wider text-gradient font-sans">
              SMIRRA
            </span>
          </Link>

          {/* Nav Items (Only visible if user is logged in) */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-white/5 border border-dark-border/60 text-brand-cyan shadow-sm shadow-brand-cyan/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-brand-cyan' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Status / Profile Dropdown (Only visible if user is logged in) */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-dark-border/40 transition-all focus:outline-none"
              >
                <div className="hidden sm:flex flex-col items-end text-xs text-right">
                  <span className="font-semibold text-slate-300">{user.name}</span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Award className="h-3.5 w-3.5 text-brand-cyan" />
                    <span>Lv. {user.level}</span>
                  </div>
                </div>
                
                <div className="h-9 w-9 rounded-xl border border-dark-border bg-gradient-to-tr from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center text-brand-cyan font-bold shadow-inner">
                  {getInitials(user.name)}
                </div>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-card p-4 border border-dark-border shadow-2xl animate-fade-in">
                  <div className="border-b border-dark-border/40 pb-3 mb-3">
                    <p className="font-bold text-slate-200 text-sm leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 break-all">{user.email}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-brand-secondary" />
                        Practice Streak
                      </span>
                      <span className="font-bold text-brand-secondary">{user.streak} Days</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-brand-cyan" />
                        Total Experience
                      </span>
                      <span className="font-bold text-brand-cyan">{user.xp} XP</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-brand-rose hover:bg-brand-rose/10 border border-transparent hover:border-brand-rose/25 transition-all"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    Sign Out Profile
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/setup" className="btn-gradient py-2 px-4 text-xs font-semibold">
              Get Started
            </Link>
          )}
          
        </div>
      </div>
    </nav>
  );
}
