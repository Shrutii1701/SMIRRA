import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('smirra_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('smirra_user');
      }
    }
    setLoading(false);
  }, []);

  // Update localStorage whenever user state changes
  const saveUser = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('smirra_user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('smirra_user');
    }
  };

  const login = (name, email) => {
    const newUser = {
      name,
      email,
      registeredDate: new Date().toISOString(),
      xp: 0,
      level: 1,
      streak: 1,
      lastPracticeDate: new Date().toDateString(),
      sessionsHistory: [],
    };
    saveUser(newUser);
  };

  const logout = () => {
    saveUser(null);
  };

  const addSession = (session) => {
    if (!user) return;

    // Calculate XP reward: Base Score (e.g. 50 score = 50 XP) + Time Bonus + Combo Bonus
    const baseScore = session.score;
    const timeBonus = session.timeBonus || 0;
    const comboBonus = session.comboBonus || 0;
    const xpGained = baseScore + timeBonus + comboBonus;

    const newXp = user.xp + xpGained;
    const newLevel = Math.floor(newXp / 500) + 1; // 500 XP per level

    // Streak checking
    const today = new Date().toDateString();
    let newStreak = user.streak;
    
    if (user.lastPracticeDate) {
      const lastPractice = new Date(user.lastPracticeDate);
      const diffTime = Math.abs(new Date(today) - lastPractice);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Reset streak
      }
    } else {
      newStreak = 1;
    }

    const updatedUser = {
      ...user,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastPracticeDate: today,
      sessionsHistory: [
        {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          topic: session.topic,
          difficulty: session.difficulty,
          score: session.score,
          xpEarned: xpGained,
          evaluation: session.evaluation, // contains missingConcepts, feedback, etc.
        },
        ...user.sessionsHistory,
      ],
    };

    saveUser(updatedUser);
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
