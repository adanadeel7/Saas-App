import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-surface dark:bg-surface border-b border-outline-variant dark:border-outline-variant docked full-width relative h-20 flex items-center">
      <div className="flex justify-between items-center w-full px-margin-desktop max-w-container-max-width mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-headline-md font-headline-md font-bold text-primary dark:text-primary tracking-tighter hover:opacity-85 transition-opacity">
            Equinox
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 font-body-md text-body-md">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`${
                    isActive('/dashboard')
                      ? 'text-primary dark:text-primary border-b-2 border-primary pb-1 font-bold'
                      : 'text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/history"
                  className={`${
                    isActive('/history')
                      ? 'text-primary dark:text-primary border-b-2 border-primary pb-1 font-bold'
                      : 'text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200'
                  }`}
                >
                  History
                </Link>
                <Link
                  to="/pricing"
                  className={`${
                    isActive('/pricing')
                      ? 'text-primary dark:text-primary border-b-2 border-primary pb-1 font-bold'
                      : 'text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200'
                  }`}
                >
                  Pricing
                </Link>
                <Link
                  to="/settings"
                  className={`${
                    isActive('/settings')
                      ? 'text-primary dark:text-primary border-b-2 border-primary pb-1 font-bold'
                      : 'text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200'
                  }`}
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                <a href="#features" className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200">
                  Features
                </a>
                <Link
                  to="/pricing"
                  className={`${
                    isActive('/pricing')
                      ? 'text-primary dark:text-primary border-b-2 border-primary pb-1 font-bold'
                      : 'text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors duration-200'
                  }`}
                >
                  Pricing
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-sm text-on-surface-variant">
                Hi, <span className="font-bold text-primary">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-surface-container-high border border-outline-variant hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 px-4 py-2 rounded-lg font-bold transition-all text-xs"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-on-surface-variant font-body-md hover:text-primary transition-colors duration-200 px-3 py-2 text-sm"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-primary text-on-primary hover:opacity-90 px-5 py-2 rounded-lg font-bold transition-all text-sm active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
