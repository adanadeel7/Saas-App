import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Failed to login');
    }

    if (isSuccess || user) {
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter all fields');
      return;
    }

    const userData = { email, password };
    dispatch(login(userData));
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md antialiased min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center opacity-30">
        <div className="w-[800px] h-[800px] bg-primary-container/10 rounded-full blur-[120px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-[420px] bg-surface border border-outline-variant rounded-xl p-8 shadow-2xl shadow-black/60 flex flex-col gap-8 glass-panel animate-fade-in">
        <header className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-surface-container-high border border-outline-variant rounded-lg flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>
              target
            </span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Equinox Login</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Secure access to your workspace</p>
          </div>
        </header>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">
                mail
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">
                lock
              </span>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-primary text-on-primary rounded-lg py-3 px-4 font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container hover:text-on-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-[0_0_15px_rgba(173,198,255,0.15)] flex justify-center items-center gap-2 group cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            {!isLoading && (
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 w-full">
          <div className="h-px bg-outline-variant flex-1"></div>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">or</span>
          <div className="h-px bg-outline-variant flex-1"></div>
        </div>

        <button
          onClick={() => toast('Social logins are coming soon!')}
          className="w-full bg-transparent border border-outline-variant text-on-surface rounded-lg py-3 px-4 font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-outline-variant transition-all flex justify-center items-center gap-3 cursor-pointer"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          Sign in with Google
        </button>
      </main>

      <footer className="mt-8 relative z-10 text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          New to Equinox? 
          <Link to="/register" className="text-primary hover:text-primary-container font-semibold transition-colors focus:outline-none focus:underline ml-1">
            Create an account
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default Login;
