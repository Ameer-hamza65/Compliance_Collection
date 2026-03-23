import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export interface UserState {
  isLoggedIn: boolean;
  id?: string;
  name?: string;
  email?: string;
  enterpriseId?: string;
  role?: string;
}

interface UserContextType {
  user: UserState;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  hasFullAccess: (bookId: string) => boolean;
}

const defaultUser: UserState = { isLoggedIn: false };

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>(defaultUser);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser: User) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, enterprise_id, role')
      .eq('id', authUser.id)
      .maybeSingle();

    setUser({
      isLoggedIn: true,
      id: authUser.id,
      email: profile?.email ?? authUser.email ?? '',
      name: profile?.full_name ?? authUser.email?.split('@')[0] ?? '',
      enterpriseId: profile?.enterprise_id ?? undefined,
      role: profile?.role ?? 'staff',
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Defer profile loading to avoid Supabase auth callback deadlock
        setTimeout(() => {
          void loadProfile(session.user);
        }, 0);
      } else {
        setUser(defaultUser);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        void loadProfile(session.user);
      } else {
        setUser(defaultUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(defaultUser);
    setSession(null);
  }, []);

  const hasFullAccess = useCallback((_bookId: string) => {
    return !!user.enterpriseId;
  }, [user.enterpriseId]);

  return (
    <UserContext.Provider value={{ user, session, loading, logout, hasFullAccess }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
