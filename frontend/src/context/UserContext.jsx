import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, fetchUser, saveSession as saveSessionApi } from '../services/api';

const UserContext = createContext();

const STORAGE_KEY = 'smirra_user';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persist the profile locally as a cache for instant loads and offline viewing.
  const saveUser = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // On mount: hydrate from cache instantly, then refresh from the backend if
  // this is a server-backed account.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let cached = null;
    if (stored) {
      try {
        cached = JSON.parse(stored);
        setUser(cached);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    async function sync() {
      if (cached && cached.id && !cached.local) {
        try {
          const fresh = await fetchUser(cached.id);
          saveUser(fresh);
        } catch {
          // Backend unreachable — keep showing the cached profile.
        }
      }
      setLoading(false);
    }
    sync();
  }, []);

  /**
   * Log in. Tries the backend first; if it is unreachable or the database is
   * not configured, falls back to a local-only profile so the app still works.
   */
  const login = async (name, email) => {
    try {
      const profile = await loginUser(name, email);
      saveUser(profile);
      return profile;
    } catch {
      // Local fallback (no persistence beyond this browser).
      const finalEmail = email?.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@smirra.local`;
      const localUser = {
        id: null,
        local: true,
        name: name.trim(),
        email: finalEmail,
        registeredDate: new Date().toISOString(),
        xp: 0,
        level: 1,
        streak: 1,
        lastPracticeDate: new Date().toDateString(),
        sessionsHistory: [],
      };
      saveUser(localUser);
      return localUser;
    }
  };

  const logout = () => {
    saveUser(null);
  };

  /**
   * Record a completed interview. Server-backed accounts persist to MongoDB and
   * receive recomputed XP/level/streak; local accounts compute it in-browser.
   */
  const addSession = async ({ topic, difficulty, gradedResponses }) => {
    if (!user) return;

    if (user.id && !user.local) {
      try {
        const { user: updated } = await saveSessionApi(user.id, { topic, difficulty, gradedResponses });
        saveUser(updated);
        return;
      } catch {
        // Fall through to local computation if the save fails.
      }
    }

    // Local fallback progression (mirrors backend scoringService).
    const count = gradedResponses.length;
    const avgScore = Math.round(
      gradedResponses.reduce((sum, r) => sum + (r.evaluation?.overallScore || 0), 0) / count
    );
    const timeBonus = gradedResponses.reduce((sum, r) => sum + (r.timeBonus || 0), 0);
    const comboBonus = gradedResponses.reduce((sum, r) => sum + (r.comboBonus || 0), 0);
    const xpGained = avgScore + timeBonus + comboBonus;

    const newXp = user.xp + xpGained;
    const newLevel = Math.floor(newXp / 500) + 1;

    const today = new Date().toDateString();
    let newStreak = user.streak;
    if (user.lastPracticeDate) {
      const diffDays = Math.ceil(
        Math.abs(new Date(today) - new Date(user.lastPracticeDate)) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) newStreak += 1;
      else if (diffDays > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }

    saveUser({
      ...user,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastPracticeDate: today,
      sessionsHistory: [
        {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          topic,
          difficulty,
          score: avgScore,
          xpEarned: xpGained,
          evaluation: {
            feedbackSummary: gradedResponses[0]?.evaluation?.feedback || '',
            itemsCount: count,
          },
        },
        ...user.sessionsHistory,
      ],
    });
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, addSession }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
