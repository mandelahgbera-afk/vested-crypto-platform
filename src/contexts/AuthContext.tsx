import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, SuperAdmin } from '@/types';
import { signIn, signOut, signUp, getCurrentUser, supabase, adminLogin as adminLoginFn, updateAdminPassword as updateAdminPasswordFn } from '@/lib/supabase';

// ============================================
// AUTH CONTEXT TYPE
// ============================================

interface AuthContextType {
  // User authentication
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Admin authentication
  admin: SuperAdmin | null;
  isAdminAuthenticated: boolean;
  
  // User actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  
  // Admin actions
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  updateAdminCredentials: (currentPassword: string, newUsername?: string, newPassword?: string) => Promise<boolean>;
}

// ============================================
// CREATE CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// AUTH PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Admin state
  const [admin, setAdmin] = useState<SuperAdmin | null>(null);

  // ============================================
  // USER AUTHENTICATION
  // ============================================
  
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (!result) {
        console.error('Login error: No response from signIn');
        return false;
      }
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

  const signup = useCallback(async (email: string, password: string, fullName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signUp(email, password, fullName);
      if (!result) {
        console.error('Signup error: No response from signUp');
        return false;
      }
      if (result.error) {
        console.error('Signup error:', result.error);
        return false;
      }
      if (result.user) {
        setUser(result.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
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
  // ADMIN AUTHENTICATION (Separate from Supabase)
  // ============================================
  // Admin authentication is handled separately via the super_admin table
  
  const adminLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await adminLoginFn(username, password);
      
      if (result.error) {
        console.error('Admin login error:', result.error);
        return false;
      }
      
      if (result.admin) {
        setAdmin(result.admin);
        // Store admin session in localStorage for persistence
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('vested_admin_session', JSON.stringify(result.admin));
        }
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
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('vested_admin_session');
    }
  }, []);

  const updateAdminCredentials = useCallback(async (
    currentPassword: string,
    _newUsername?: string,
    newPassword?: string
  ): Promise<boolean> => {
    try {
      if (!admin || !newPassword) {
        return false;
      }

      const result = await updateAdminPasswordFn(admin.id, currentPassword, newPassword);
      
      if (result.error) {
        console.error('Update admin password error:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update admin credentials error:', error);
      return false;
    }
  }, [admin]);

  // ============================================
  // INITIALIZE AUTH STATE
  // ============================================

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Check for stored admin session
        if (typeof window !== 'undefined') {
          const storedAdmin = window.localStorage.getItem('vested_admin_session');
          if (storedAdmin) {
            try {
              const adminData = JSON.parse(storedAdmin);
              setAdmin(adminData);
            } catch (error) {
              console.error('Failed to restore admin session:', error);
              window.localStorage.removeItem('vested_admin_session');
            }
          }
        }

        // Check for user session
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for user auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const user = await getCurrentUser();
          setUser(user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  
  const value: AuthContextType = {
    // User
    user,
    isLoading,
    isAuthenticated: !!user,
    
    // Admin
    admin,
    isAdminAuthenticated: !!admin,
    
    // User actions
    login,
    signup,
    logout,
    refreshUser,
    
    // Admin actions
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

// ============================================
// USE AUTH HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
