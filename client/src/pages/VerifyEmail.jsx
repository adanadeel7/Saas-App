import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from '../features/auth/authSlice';
import API from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const token = searchParams.get('token');
  const { user } = useSelector((state) => state.auth);

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided in the link.');
        return;
      }

      try {
        const response = await API.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // If the user is logged in, refresh their profile state to clear the unverified banner
        if (user) {
          dispatch(getMe());
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    verifyToken();
  }, [token, dispatch]);

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-margin-mobile relative">
      {/* Decorative Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center opacity-30">
        <div className="w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[100px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-[500px] bg-surface border border-outline-variant rounded-xl p-10 shadow-2xl text-center flex flex-col items-center gap-8 glass-panel animate-fade-in">
        {status === 'verifying' && (
          <>
            {/* Loading Spinner */}
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div>
              <h1 className="font-display-lg text-2xl font-extrabold text-on-surface mb-2">Verifying Your Email</h1>
              <p className="font-body-md text-on-surface-variant max-w-sm">
                Confirming your credentials with the Equinox secure database. Please hold...
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            {/* Animated Success Checkmark */}
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 shadow-lg animate-bounce">
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
                verified
              </span>
            </div>
            <div>
              <h1 className="font-display-lg text-3xl font-extrabold text-on-surface mb-2">Verification Complete!</h1>
              <p className="font-body-md text-on-surface-variant max-w-sm">
                {message} You have successfully activated full invoice creation capabilities on your Equinox account.
              </p>
            </div>
            <div className="w-full pt-4">
              <Link
                to={user ? "/dashboard" : "/login"}
                className="w-full block bg-primary text-on-primary py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 duration-200 text-center text-sm shadow-md"
              >
                {user ? "Go to Dashboard" : "Log In to Account"}
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            {/* Error Badge */}
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 shadow-lg">
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
                error
              </span>
            </div>
            <div>
              <h1 className="font-display-lg text-2xl font-extrabold text-on-surface mb-2">Verification Failed</h1>
              <p className="font-body-md text-on-surface-variant max-w-sm">
                {message}
              </p>
            </div>
            <div className="w-full pt-4 space-y-3">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="w-full block bg-surface-container-high border border-outline-variant text-on-surface py-3 rounded-xl font-bold hover:bg-surface-container transition-all active:scale-95 duration-200 text-center text-sm"
              >
                {user ? "Back to Dashboard" : "Register a New Account"}
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default VerifyEmail;
