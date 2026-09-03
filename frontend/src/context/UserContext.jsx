import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  register as registerApi,
  login as loginApi,
  fetchMe,
  saveSession as saveSessionApi,
  getToken,
  setToken,
} from '../services/api';

const UserContext = createContext();

const STORAGE_KEY = 'smirra_user';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cache the profile locally for instant loads; the token is the source of auth.
  const saveUser = (updatedUser) => {
    setUser(updatedUser);
    try {
      if (updatedUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore storage errors */
    }
  };

  // On mount: if a token exists, hydrate from cache instantly then refresh from
  // the backend. If the token is invalid/expired, sign out.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }

    (async () => {
      try {
        const fresh = await fetchMe();
        saveUser(fresh);
      } catch (err) {
        // Only clear the session on an auth failure — keep it if the backend is
        // merely unreachable, so a dropped server doesn't log the user out.
        if (!/reach the SMIRRA server/i.test(err.message)) {
          setToken(null);
          saveUser(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const register = async (name, email, password) => {
    const profile = await registerApi(name, email, password);
    saveUser(profile);
    return profile;
  };

  const login = async (email, password) => {
    const profile = await loginApi(email, password);
    saveUser(profile);
    return profile;
  };

  const logout = () => {
    setToken(null);
    saveUser(null);
  };

  /**
   * Record a completed interview for the signed-in user. XP/level/streak are
   * recomputed on the backend and returned.
   */
  const addSession = async ({ topic, difficulty, gradedResponses }) => {
    if (!user) return;
    try {
      const { user: updated } = await saveSessionApi({ topic, difficulty, gradedResponses });
      saveUser(updated);
    } catch {
      // Non-fatal: the session UI still shows this round's results even if the
      // save failed (e.g. backend/DB unavailable).
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, register, login, logout, addSession }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
