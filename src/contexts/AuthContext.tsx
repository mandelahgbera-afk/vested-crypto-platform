import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, SuperAdmin } from '@/types';
import { signIn, signOut, signUp, getCurrentUser, supabase, adminLogin as adminLoginFn, updateAdminPassword as updateAdminPasswordFn } from '@/lib/supabase';

// ============================================
// AUTH CONTEXT TYPE
// ============================================

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  admin: SuperAdmin | null;
  isAdminAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; needsConfirmation: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;

  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  updateAdminCredentials: (currentPassword: string, newUsername?: string, newPassword?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [admin, setAdmin] = useState<SuperAdmin | null>(null);

  // ============================================
  // USER AUTHENTICATION
  // ============================================

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (!result) return false;
      if (result.error) {
        console.error('Login error:', result.error);
        return false;
      }
      if (result.user) {
        setUser(result.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; needsConfirmation: boolean }> => {
    setIsLoading(true);
    try {
      const result = await signUp(email, password, fullName);
      if (!result) return { success: false, needsConfirmation: false };
      if (result.error) {
        console.error('Signup error:', result.error);
        return { success: false, needsConfirmation: false };
      }
      if (result.needsConfirmation) {
        return { success: true, needsConfirmation: true };
      }
      if (result.user) {
        setUser(result.user);
        return { success: true, needsConfirmation: false };
      }
      return { success: false, needsConfirmation: false };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, needsConfirmation: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAdmin(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const refreshed = await getCurrentUser();
    if (refreshed) {
      setUser(refreshed);
    }
  }, []);

  // ============================================
  // ADMIN AUTHENTICATION
  // ============================================

  const adminLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await adminLoginFn(username, password);

      if (result.error) {
        console.error('Admin login error:', result.error);
        return false;
      }
      if (result.admin) {
        setAdmin(result.admin as SuperAdmin);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const adminLogout = useCallback(() => {
    setAdmin(null);
  }, []);

  const updateAdminCredentials = useCallback(async (
    currentPassword: string,
    _newUsername?: string,
    newPassword?: string
  ): Promise<boolean> => {
    if (!admin) return false;
    try {
      if (newPassword) {
        const result = await updateAdminPasswordFn(admin.id, currentPassword, newPassword);
        if (result.error) {
          console.error('Update admin credentials error:', result.error);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Update admin credentials error:', error);
      return false;
    }
  }, [admin]);

  // ============================================
  // AUTH STATE LISTENER
  // ============================================

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userProfile = await getCurrentUser();
        if (userProfile) {
          setUser(userProfile);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Load initial user on mount
    getCurrentUser().then((profile) => {
      if (profile) setUser(profile);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    admin,
    isAdminAuthenticated: !!admin,
    login,
    signup,
    logout,
    refreshUser,
    adminLogin,
    adminLogout,
    updateAdminCredentials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
