import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2, KeyRound, Mail, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../Common/Toast';

export default function AuthScreen({ selectedRole, onBackToLanding }) {
  const { login, signup, loginWithGoogle, resetPassword } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [authError, setAuthError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const flashError = localStorage.getItem('auth_error_flash');
    if (flashError) {
      setAuthError(flashError);
      setToast({ message: flashError, type: 'error' });
      localStorage.removeItem('auth_error_flash');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (authError) setAuthError('');
  };

  const handleAuthError = (err) => {
    console.error("Auth error:", err);
    switch (err.code) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/role-mismatch':
        return err.message;
      default:
        return err.message || 'An error occurred during authentication.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    if (!email || !password) {
      setAuthError('Email and Password fields are required.');
      return;
    }

    if (isSignUp && !name) {
      setAuthError('Full Name is required for registration.');
      return;
    }

    setLoading(true);
    setAuthError('');

    try {
      if (isSignUp) {
        await signup(email, password, name, selectedRole);
      } else {
        await login(email, password, selectedRole);
      }
    } catch (err) {
      const errMsg = handleAuthError(err);
      setAuthError(errMsg);
      setToast({ message: errMsg, type: 'error' });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError('');
    try {
      await loginWithGoogle(selectedRole);
    } catch (err) {
      const errMsg = handleAuthError(err);
      setAuthError(errMsg);
      setToast({ message: errMsg, type: 'error' });
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const { email } = formData;
    if (!email) {
      const msg = 'Please enter your email address to reset your password.';
      setAuthError(msg);
      setToast({ message: msg, type: 'error' });
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      await resetPassword(email);
      setResetSent(true);
      setToast({ message: 'Password reset link sent to your email.', type: 'success' });
      setLoading(false);
    } catch (err) {
      const errMsg = handleAuthError(err);
      setAuthError(errMsg);
      setToast({ message: errMsg, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center px-4 py-8">
      
      {/* Back Button */}
      <button 
        onClick={onBackToLanding}
        className="absolute top-6 left-6 text-xs font-semibold text-muted-text hover:text-body-text flex items-center gap-1.5 p-2 bg-white/40 hover:bg-white border border-border-divider/30 rounded-xl transition-all"
        disabled={loading}
      >
        <ArrowLeft size={14} />
        Back to Landing
      </button>

      {/* Card Wrapper */}
      <div className="w-full max-w-[440px] bg-white border border-border-divider rounded-2xl p-8 sm:p-10 shadow-lg animate-scale-up">
        
        {/* Logo and Pill */}
        <div className="flex flex-col items-center text-center mb-8 space-y-3 select-none">
          <h2 className="text-2xl font-black font-serif text-body-text tracking-tight flex items-center gap-1">
            TalentHub
            <span className="w-2.5 h-2.5 bg-primary-avocado rounded-full inline-block" />
          </h2>
          
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-badge-dept-bg text-badge-dept-text border border-primary-avocado/15">
            Role: {selectedRole === 'provider' ? 'Job Provider' : 'Job Seeker'}
          </span>
        </div>

        <h3 className="text-xl font-bold text-body-text text-center mb-6">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h3>

        {authError && (
          <div className="mb-4 text-xs font-medium text-danger-reject bg-red-50 border border-red-200 p-3 rounded-xl">
            {authError}
          </div>
        )}

        {resetSent && (
          <div className="mb-4 text-xs font-medium text-badge-ft-text bg-badge-ft-bg border border-primary-avocado/30 p-3 rounded-xl">
            Password reset link sent to your email.
          </div>
        )}

        {/* Google Authentication */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-border-divider rounded-xl hover:bg-page-bg text-sm font-semibold text-body-text bg-white shadow-2xs hover:shadow-xs transition-all"
        >
          {/* Google Icon SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.84-4.53z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Or Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-border-divider/50"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-muted-text tracking-wide uppercase">or email</span>
          <div className="flex-grow border-t border-border-divider/50"></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name (Sign Up only) */}
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-muted-text mb-1 flex items-center gap-1">
                <User size={13} className="text-primary-avocado" />
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                disabled={loading}
                className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent"
              />
            </div>
          )}

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-muted-text mb-1 flex items-center gap-1">
              <Mail size={13} className="text-primary-avocado" />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              disabled={loading}
              className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl px-4 py-2.5 bg-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="text-xs font-semibold text-muted-text flex items-center gap-1">
                <KeyRound size={13} className="text-primary-avocado" />
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-[11px] font-semibold text-primary-avocado hover:text-primary-hover focus:outline-none"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full text-sm border border-border-divider focus:border-primary-avocado focus:ring-1 focus:ring-primary-avocado outline-none rounded-xl pl-4 pr-10 py-2.5 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-text hover:text-body-text focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-avocado hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Authenticating...
              </>
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError('');
              setResetSent(false);
            }}
            disabled={loading}
            className="text-xs font-semibold text-primary-avocado hover:text-primary-hover"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

    </div>
  );
}
