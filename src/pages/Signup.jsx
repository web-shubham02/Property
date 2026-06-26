import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, getRedirectUrl } from '../supabaseClient';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, MailOpen, CheckCircle2, ExternalLink, RefreshCw, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { signUp, isMock, resendVerificationEmail, user, profile } = useAuth();
  const navigate = useNavigate();
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verification Success Dashboard State
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (user) {
      if (profile?.is_agent) {
        navigate('/agent/dashboard', { replace: true });
      } else {
        navigate('/properties', { replace: true });
      }
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all the fields.');
      return;
    }

    // Block disposable email addresses
    const blockedDomains = [
      'tempmail.com', 'temp-mail.org', '10minutemail.com', 
      'guerrillamail.com', 'mailinator.com', 'throwawaymail.com',
      'yopmail.com', 'getnada.com', 'fakeinbox.com', 'trashmail.com',
      'maildrop.cc', 'sharklasers.com', 'guerrillamailblock.com',
      'dispostable.com', 'mintemail.com', 'spamgourmet.com'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(domain)) {
      setError('Please use a permanent email address. Temporary email services are not allowed.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await signUp(email, password, fullName);
      
      if (signUpError) {
        throw signUpError;
      }

      // Check if session exists. If not, it means email verification is required.
      if (isMock || data?.session) {
        // Successfully signed up and logged in (mock mode or auto-login)
        navigate('/properties');
      } else {
        // Email verification required, show Check Your Email dashboard
        setIsRegistered(true);
        setRegisteredEmail(email);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    setResendError('');
    try {
      const { error: resendErr } = await resendVerificationEmail(registeredEmail);
      if (resendErr) throw resendErr;
      setResendMessage('Verification email resent successfully!');
      setResendCooldown(60);
    } catch (err) {
      console.error(err);
      setResendError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      setError('Failed to sign up with Google. Please try again.');
    }
  };


  if (isRegistered) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center font-sans px-4" id="page-signup-success">
        <div className="bg-white border border-gray-150 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6 text-center">
          
          {/* Visual Step Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={12} /> Account Created
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-brand flex items-center gap-1 bg-brand-light px-2 py-0.5 rounded-full">
              Verification Pending
            </span>
          </div>

          {/* Pulse Mail Icon */}
          <div className="relative flex items-center justify-center py-4">
            <div className="absolute w-20 h-20 bg-brand-light rounded-full animate-ping opacity-25"></div>
            <div className="relative w-16 h-16 bg-brand-light text-brand rounded-full flex items-center justify-center border border-brand/10 shadow-inner">
              <MailOpen size={32} className="animate-pulse" />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold font-outfit text-brand">Check Your Email</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              We've sent a confirmation link to <span className="font-semibold text-brand-dark">{registeredEmail}</span>. Please verify your email to continue.
            </p>
          </div>

          {/* Dashboard Info Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-gray-100 text-left space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
              <span className="text-gray-500 font-medium">Verification Status</span>
              <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                Awaiting Click
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Link Expiration</span>
              <span className="text-gray-700 font-semibold">24 Hours</span>
            </div>
            <div className="text-[11px] text-gray-400 pt-1 leading-normal">
              💡 Pro Tip: Check your Spam or Updates tab if you don't receive it within 2 minutes.
            </div>
          </div>

          {/* Email Provider Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Open Gmail
              <ExternalLink size={12} />
            </a>
            <a
              href="https://outlook.live.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Open Outlook
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Resend Action */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <p className="text-xs text-gray-500">Didn't receive the email?</p>
            {resendMessage && (
              <div className="text-xs text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-250">
                {resendMessage}
              </div>
            )}
            {resendError && (
              <div className="text-xs text-red-600 bg-red-50 py-1.5 px-3 rounded-lg border border-red-250">
                {resendError}
              </div>
            )}
            <button
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-dark transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendLoading ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend Email in ${resendCooldown}s`
              ) : (
                <>
                  <RefreshCw size={12} />
                  Resend Verification Link
                </>
              )}
            </button>
          </div>

          {/* Return button */}
          <div className="pt-2">
            <Link
              to="/login"
              className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Proceed to Login
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center font-sans px-4" id="page-signup">
      <div className="bg-white border border-gray-150 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold font-outfit text-brand">Create Account</h1>
          <p className="text-xs text-gray-500">Sign up to buy verified land or submit listings to our agent.</p>
        </div>

        {isMock && (
          <div className="bg-amber-50 text-amber-800 text-xs px-3.5 py-2.5 rounded-lg border border-amber-250 flex items-start gap-2 leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong>Mock Mode Active:</strong> Account details will be saved to your local storage to allow seamless flow simulation without live email validation.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-700 text-xs px-3.5 py-2.5 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              />
            </div>
          </div>

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
                autoComplete="new-password"
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            id="btn-signup-submit"
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-brand/50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Create Account'
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
          onClick={handleGoogleSignup}
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
        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Already have an account?{' '}
          <Link to="/login" id="link-goto-login" className="text-brand font-bold hover:underline">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}
