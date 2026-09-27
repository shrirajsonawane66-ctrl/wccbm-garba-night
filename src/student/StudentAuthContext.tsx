import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '../lib/api.ts';
import type { SignupPayload, StudentSession } from '../types.ts';

interface StudentAuthContextType {
  token: string | null;
  session: StudentSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (payload: SignupPayload) => Promise<StudentSession>;
  login: (email: string, password: string) => Promise<StudentSession>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export const StudentAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => api.studentGetToken());
  const [session, setSession] = useState<StudentSession | null>(null);
  const [loading, setLoading] = useState<boolean>(!!api.studentGetToken());

  const applySession = (res: StudentSession) => {
    if (res.access_token) {
      api.studentSetToken(res.access_token);
      setToken(res.access_token);
    }
    setSession(res);
  };

  const refresh = useCallback(async () => {
    const t = api.studentGetToken();
    if (!t) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.authMe(t);
      setSession(res);
    } catch {
      api.studentClearToken();
      setToken(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signup = useCallback(async (payload: SignupPayload) => {
    const res = await api.authSignup(payload);
    applySession(res);
    return res;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.authLogin(email, password);
    applySession(res);
    return res;
  }, []);

  const logout = useCallback(() => {
    api.authLogout().catch(() => {});
    api.studentClearToken();
    setToken(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      session,
      loading,
      isAuthenticated: !!token && !!session,
      signup,
      login,
      logout,
      refresh,
    }),
    [token, session, loading, signup, login, logout, refresh],
  );

  return <StudentAuthContext.Provider value={value}>{children}</StudentAuthContext.Provider>;
};

export const useStudentAuth = (): StudentAuthContextType => {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return ctx;
};