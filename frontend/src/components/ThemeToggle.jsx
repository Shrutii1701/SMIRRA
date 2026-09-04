import React, { useEffect, useState } from 'react';
import { Moon, Coffee } from 'lucide-react';

/**
 * Switches between the two palettes: 'nyna' (default, violet/blue) and 'mocha'
 * (warm coffee/cream). The choice persists in localStorage and is applied to
 * <html data-theme>. index.html applies it before paint to avoid a flash.
 */
const THEMES = {
  nyna: { next: 'mocha', icon: Coffee, label: 'Mocha theme' },
  mocha: { next: 'nyna', icon: Moon, label: 'Midnight theme' },
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState('nyna');

  useEffect(() => {
    let saved = 'nyna';
    try {
      if (localStorage.getItem('smirra_theme') === 'mocha') saved = 'mocha';
    } catch { /* ignore */ }
    setTheme(saved);
  }, []);

  const apply = (t) => {
    setTheme(t);
    if (t === 'mocha') document.documentElement.setAttribute('data-theme', 'mocha');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('smirra_theme', t); } catch { /* ignore */ }
  };

  const meta = THEMES[theme];
  const Icon = meta.icon;

  return (
    <button
      onClick={() => apply(meta.next)}
      title={`Switch to ${meta.label}`}
      aria-label={`Switch to ${meta.label}`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-dark-border/50 bg-white/5 text-slate-300 hover:text-brand-cyan hover:bg-white/10 transition-colors"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
