import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, getRedirectUrl } from '../supabaseClient';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { signIn, isMock, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      if (profile?.is_agent) {
        navigate('/agent/dashboard', { replace: true });
      } else {
        navigate('/properties', { replace: true });
      }
    }
  }, [user, profile, navigate]);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  
  // Unconfirmed email alert/resend State
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  
  // Success banner state (from reset-password redirect)
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Check where to route the client
  const routeUserAfterLogin = async (userObj) => {
    // 1. Fetch profile to check if is_agent
    let isAgent = false;
    
    if (isMock) {
      const savedMockProfile = localStorage.getItem('dharasetu_mock_profile');
      if (savedMockProfile) {
        const prof = JSON.parse(savedMockProfile);
        isAgent = prof.is_agent;
      }
    } else {
      try {
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('is_agent')
          .eq('id', userObj.id)
          .single();
        
        if (!profErr && prof) {
          isAgent = prof.is_agent;
        }
      } catch (err) {
        console.error('Error fetching profile for routing:', err);
      }
    }

    if (isAgent) {
      navigate('/agent/dashboard');
      return;
    }

    // Redirect standard users to properties directly
    navigate('/properties', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setUnconfirmedEmail('');

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        throw signInError;
      }

      if (data?.user) {
        await routeUserAfterLogin(data.user);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.message || '';
      if (errMsg.toLowerCase().includes('email not confirmed') || errMsg.toLowerCase().includes('confirm your email')) {
        setUnconfirmedEmail(email);
        setError('Please verify your email first. Check your inbox.');
      } else {
        setError(errMsg || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');
    try {
      if (isMock) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setResetSuccess('If an account exists with this email, a reset link has been sent.');
        return;
      }
      await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: getRedirectUrl('reset-password'),
      });
      // Show secure message always, regardless of error, to prevent account enumeration
      setResetSuccess('If an account exists with this email, a reset link has been sent.');
    } catch (err) {
      console.error(err);
      setResetError(err.message || 'An error occurred. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage('');
    setResendError('');
    try {
      if (isMock) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setResendMessage('Verification email resent successfully!');
        return;
      }
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail,
        options: {
          emailRedirectTo: getRedirectUrl()
        }
      });
      if (error) throw error;
      setResendMessage('Verification email resent successfully!');
    } catch (err) {
      console.error(err);
      setResendError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: {
            prompt: 'select_account'
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError('Failed to log in with Google. Please try again.');
    }
  };

  // Mock account shortcuts
  const handleQuickLogin = async (type) => {
    let mockEmail;
    let mockPassword = 'password123';

    if (type === 'agent') {
      mockEmail = 'agent@dharasetu.com';
    } else if (type === 'buyer') {
      mockEmail = 'buyer@dharasetu.com';
    } else {
      mockEmail = 'seller@dharasetu.com';
    }

    setEmail(mockEmail);
    setPassword(mockPassword);
    
    setLoading(true);
    try {
      const { data, error: quickError } = await signIn(mockEmail, mockPassword);
      if (!quickError && data?.user) {
        await routeUserAfterLogin(data.user);
      }
    } catch (err) {
      setError('Quick login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center font-sans px-4" id="page-forgot-password">
        <div className="bg-white border border-gray-150 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold font-outfit text-brand">Reset Password</h1>
            <p className="text-xs text-gray-500">Enter your email and we'll send you a password reset link.</p>
          </div>

          {/* Alerts */}
          {resetError && (
            <div className="bg-red-50 text-red-700 text-xs px-3.5 py-2.5 rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{resetError}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="bg-emerald-50 text-emerald-800 text-xs px-3.5 py-2.5 rounded-lg border border-emerald-250 flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{resetSuccess}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="johndoe@example.com"
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={resetLoading}
              id="btn-forgot-submit"
              className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-brand/50 disabled:cursor-not-allowed"
            >
              {resetLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Return to login footer */}
          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-150">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="text-brand font-bold hover:underline cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center font-sans px-4" id="page-login">
      <div className="bg-white border border-gray-150 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold font-outfit text-brand">Sign In</h1>
          <p className="text-xs text-gray-500">Access your DharaSetu land portal dashboard.</p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 text-emerald-800 text-xs px-3.5 py-2.5 rounded-lg border border-emerald-250 flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-700 text-xs px-3.5 py-2.5 rounded-lg border border-red-200 flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
            {unconfirmedEmail && (
              <div className="pt-2 border-t border-red-200/40 flex items-center justify-between text-[11px]">
                {resendMessage ? (
                  <span className="text-emerald-700 font-bold">{resendMessage}</span>
                ) : resendError ? (
                  <span className="text-red-800 font-bold">{resendError}</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-brand font-extrabold hover:underline cursor-pointer disabled:text-gray-400 disabled:no-underline"
                  >
                    {resendLoading ? 'Resending...' : 'Resend verification email'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@example.com"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-brand transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="text-right pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setResetEmail(email);
                }}
                className="text-xs text-brand hover:underline font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            id="btn-login-submit"
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-brand/50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Google Auth Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>


        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-150">
          Don't have an account?{' '}
          <Link to="/signup" id="link-goto-signup" className="text-brand font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>

      {/* Quick Access panel in Mock Mode */}
      {isMock && (
        <div className="mt-8 bg-amber-50/50 border border-amber-200/50 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-amber-800">
            <Sparkles size={16} />
            <h4 className="font-outfit font-bold text-xs uppercase tracking-wider">Mock Quick Sandbox Login</h4>
          </div>
          <p className="text-[11px] text-amber-700/80 leading-normal">
            Supabase is in placeholder mode. Click below to bypass signup and immediately test the dashboards:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('agent')}
              id="btn-quick-login-agent"
              className="bg-white hover:bg-brand hover:text-white border border-amber-200/70 text-[10px] font-bold py-2 px-1 rounded-lg text-brand shadow-sm transition-all"
            >
              As Agent
            </button>
            <button
              onClick={() => handleQuickLogin('buyer')}
              id="btn-quick-login-buyer"
              className="bg-white hover:bg-brand hover:text-white border border-amber-200/70 text-[10px] font-bold py-2 px-1 rounded-lg text-brand shadow-sm transition-all"
            >
              As Buyer
            </button>
            <button
              onClick={() => handleQuickLogin('seller')}
              id="btn-quick-login-seller"
              className="bg-white hover:bg-brand hover:text-white border border-amber-200/70 text-[10px] font-bold py-2 px-1 rounded-lg text-brand shadow-sm transition-all"
            >
              As Seller
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
