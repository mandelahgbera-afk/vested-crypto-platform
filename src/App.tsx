import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import LandingPage from '@/sections/landing/LandingPage';
import SignInPage from '@/sections/auth/SignInPage';
import SignUpPage from '@/sections/auth/SignUpPage';
import AdminLoginPage from '@/sections/auth/AdminLoginPage';
import AuthCallbackPage from '@/sections/auth/AuthCallbackPage';
import UserDashboard from '@/sections/user/UserDashboard';
import AdminDashboard from '@/sections/admin/AdminDashboard';

// ============================================
// PAGE TYPES
// ============================================

export type Page = 
  | 'landing' 
  | 'signin' 
  | 'signup' 
  | 'auth-callback'  // OTP/email confirmation callback
  | 'admin-login'  // Dedicated admin login page
  | 'dashboard' 
  | 'market' 
  | 'deposit' 
  | 'withdraw' 
  | 'copytraders' 
  | 'profile' 
  | 'transactions'
  | 'admin';

// ============================================
// APP CONTENT
// ============================================

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const { isAuthenticated, isAdminAuthenticated } = useAuth();

  // Handle navigation
  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Redirect based on auth state
  useEffect(() => {
    // If admin is logged in, ensure they stay on admin pages
    if (isAdminAuthenticated) {
      if (currentPage !== 'admin') {
        navigate('admin');
      }
    }
    // If regular user is logged in, redirect away from auth pages
    else if (isAuthenticated) {
      if (['landing', 'signin', 'signup', 'admin-login'].includes(currentPage)) {
        navigate('dashboard');
      }
    }
  }, [isAuthenticated, isAdminAuthenticated, currentPage]);

  // Handle auth callback page based on URL
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const search = window.location.search.substring(1);
    
    if ((hash.includes('access_token') || hash.includes('refresh_token')) || 
        (search.includes('token=') && search.includes('email='))) {
      setCurrentPage('auth-callback');
    }
  }, []);

  // Render the appropriate page
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'signin':
        return <SignInPage onNavigate={navigate} />;
      case 'signup':
        return <SignUpPage onNavigate={navigate} />;
      case 'auth-callback':
        return <AuthCallbackPage />;
      case 'admin-login':
        return <AdminLoginPage onNavigate={navigate} />;
      case 'dashboard':
      case 'market':
      case 'deposit':
      case 'withdraw':
      case 'copytraders':
      case 'profile':
      case 'transactions':
        return (
          <UserDashboard 
            currentPage={currentPage} 
            onNavigate={navigate} 
          />
        );
      case 'admin':
        return <AdminDashboard onNavigate={navigate} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0C111D]">
      {renderPage()}
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
