import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';

/**
 * Auth Callback Page
 * Handles Supabase OTP verification and email confirmation flows
 * This page is redirected to from email links sent by Supabase
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[v0] Auth callback started');
        
        // Parse the hash from URL (Supabase redirects with #access_token=...)
        const hash = window.location.hash.substring(1);
        const search = window.location.search.substring(1);
        const params = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(search);
        
        console.log('[v0] Hash:', hash ? 'present' : 'empty');
        console.log('[v0] Search:', search ? 'present' : 'empty');
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type'); // 'email', 'recovery', etc.
        const errorCode = params.get('error') || searchParams.get('error');
        const errorDescription = params.get('error_description') || searchParams.get('error_description');

        // Handle errors from Supabase
        if (errorCode) {
          console.error('[v0] Supabase error:', errorCode, errorDescription);
          setStatus('error');
          setMessage(`Error: ${errorDescription || errorCode}. Please try again.`);
          showToast(`Authentication error: ${errorDescription || errorCode}`, 'error');
          setTimeout(() => {
            window.location.href = '/signin';
          }, 3000);
          return;
        }

        if (!accessToken) {
          throw new Error('No token received from authentication');
        }

        console.log('[v0] Setting session with tokens');
        
        // Handle the access token from email confirmation link
        if (accessToken && refreshToken) {
          // Set the session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('[v0] Session error:', error);
            setStatus('error');
            setMessage('Failed to confirm email. Please try signing in.');
            showToast('Email confirmation failed', 'error');
            setTimeout(() => {
              window.location.href = '/signin';
            }, 3000);
            return;
          }

          if (data.session && data.user) {
            console.log('[v0] Session confirmed, refreshing user');
            // Update user profile if needed
            await refreshUser();
            
            setStatus('success');
            if (type === 'recovery') {
              setMessage('Password reset link verified! Redirecting...');
              showToast('You can now set a new password', 'success');
              setTimeout(() => {
                window.location.href = '/profile';
              }, 2000);
            } else {
              setMessage('Email confirmed! Redirecting to dashboard...');
              showToast('Email confirmed successfully!', 'success');
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 2000);
            }
          }
        }
      } catch (err) {
        console.error('[v0] Auth callback error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        setStatus('error');
        setMessage(`Verification failed: ${message}. Redirecting...`);
        showToast('Verification error. Please try again.', 'error');
        setTimeout(() => {
          window.location.href = '/signin';
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, refreshUser, showToast]);

  return (
    <div className="min-h-screen bg-[#0C111D] flex items-center justify-center px-4">
      <div className="text-center">
        {/* Spinner */}
        {isProcessing && (
          <div className="mb-6 flex justify-center">
            <div className="w-12 h-12 border-4 border-[#6938ef]/20 border-t-[#6938ef] rounded-full animate-spin" />
          </div>
        )}

        {/* Status Icon */}
        {status === 'success' && (
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Message */}
        <h1 className="text-2xl font-bold mb-2">
          {status === 'success' ? 'Verified!' : status === 'error' ? 'Verification Failed' : 'Verifying Email'}
        </h1>
        <p className="text-[#A5ACBA] mb-6">{message}</p>

        {/* Help Text */}
        {status === 'error' && (
          <div className="space-y-2">
            <p className="text-sm text-[#A5ACBA]">If the problem persists, try:</p>
            <ul className="text-sm text-[#A5ACBA] space-y-1">
              <li>• Check your spam folder for verification emails</li>
              <li>• Request a new verification link</li>
              <li>• Contact support if you continue to experience issues</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
