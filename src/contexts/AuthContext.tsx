import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  const fetchProfile = async (userId: string, userEmail?: string, userFullName?: string) => {
    if (!configured) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
      } else if (!data) {
        // Upsert default profile if none exists
        const defaultName = userFullName || userEmail?.split('@')[0] || 'Customer';
        const { data: inserted } = await (supabase.from('profiles') as any)
          .upsert({
            id: userId,
            email: userEmail || '',
            full_name: defaultName,
            role: 'customer',
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (inserted) {
          setProfile(inserted as Profile);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.full_name
        );
      }
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.full_name
        );
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = async (email: string, password: string) => {
    if (!configured) {
      return { error: new Error('Supabase project URL & API keys are not configured yet.') };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.user) {
      await fetchProfile(data.user.id);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'customer') => {
    if (!configured) {
      return { error: new Error('Supabase project URL & API keys are not configured yet.') };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (data.user) {
      await fetchProfile(data.user.id);
    }

    return { error };
  };

  const signOut = async () => {
    if (!configured) {
      setUser(null);
      setProfile(null);
      setSession(null);
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
