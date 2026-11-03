import * as React from 'react';
import { AdminUser, AdminRole } from '../lib/types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminAuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  hasRole: (allowedRoles: AdminRole[]) => boolean;
}

const AdminAuthContext = React.createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  // Securely verify role in trusted admin_users table
  const verifyAndSetAdminUser = React.useCallback(async (authUserId: string, _email: string): Promise<AdminUser | null> => {
    if (!supabase) return null;

    const { data: adminRecord, error } = await supabase
      .from('admin_users')
      .select('id, auth_user_id, email, name, role, avatar, created_at, last_login')
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !adminRecord) {
      console.warn('[AdminAuth] User lacks clearance in public.admin_users');
      await supabase.auth.signOut();
      setUser(null);
      return null;
    }

    const verifiedUser: AdminUser = {
      id: adminRecord.id,
      email: adminRecord.email,
      name: adminRecord.name,
      role: adminRecord.role as AdminRole,
      avatar: adminRecord.avatar,
      createdAt: adminRecord.created_at,
      lastLogin: new Date().toISOString(),
    };

    // Update last_login timestamp in background
    Promise.resolve(
      supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminRecord.id)
    ).catch(() => {});

    setUser(verifiedUser);
    return verifiedUser;
  }, []);

  // Restore and subscribe to Supabase Auth state
  React.useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    async function checkAuthSession() {
      if (!isSupabaseConfigured || !supabase) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await verifyAndSetAdminUser(session.user.id, session.user.email || '');
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('[AdminAuth] Session verification error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }

      // Listen to auth state transitions
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        } else if (session?.user) {
          await verifyAndSetAdminUser(session.user.id, session.user.email || '');
        }
      });
      subscription = authListener.subscription;
    }

    checkAuthSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [verifyAndSetAdminUser]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error:
          'Supabase backend is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to enable real authentication.',
      };
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (authError || !authData.user) {
        setLoading(false);
        return { success: false, error: authError?.message || 'Invalid email or password.' };
      }

      const verified = await verifyAndSetAdminUser(authData.user.id, authData.user.email || cleanEmail);
      setLoading(false);

      if (!verified) {
        return {
          success: false,
          error: 'Access Denied: This account is authenticated in Supabase but lacks an assigned role in the admin_users table.',
        };
      }

      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'An unexpected authentication error occurred.' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[AdminAuth] Error during signOut:', err);
      }
    }
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase backend is not configured. Cannot process password recovery.',
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/admin/login`,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const hasRole = (allowedRoles: AdminRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        login,
        logout,
        resetPassword,
        hasRole,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = React.useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
