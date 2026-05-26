import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { register, reset } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
  });

  const { name, email, password, company } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Failed to register');
    }

    if (isSuccess || user) {
      toast.success('Account created successfully!');
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

    if (!name || !email || !password) {
      toast.error('Please enter Name, Email, and Password');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const userData = { name, email, password, company };
    dispatch(register(userData));
  };

  return (
    <div className="text-on-surface antialiased min-h-[calc(100vh-80px)] flex flex-col md:flex-row bg-background">
      {/* Left Split: Content & Benefits (Visible on md+) */}
      <div className="hidden md:flex flex-col w-1/2 p-gutter lg:p-margin-desktop bg-surface-container-lowest border-r border-outline-variant relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, #3B82F6 0%, transparent 50%)' }}></div>
        <div className="relative z-10 flex-grow flex flex-col justify-between">
          <div>
            <div className="font-headline-md text-headline-md font-bold text-on-surface mb-margin-desktop">Equinox</div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-gutter">Command your finances.</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              The precision invoicing tool engineered for high-performing freelancers. Build your foundation.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div>
                <div className="font-body-md text-body-md text-on-surface">Join 5,000+ freelancers</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">A community of elite professionals.</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <div>
                <div className="font-body-md text-body-md text-on-surface">Generate invoices in seconds</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">Streamlined creation process.</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <div className="font-body-md text-body-md text-on-surface">Get paid faster</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">Integrated payment solutions.</div>
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-lg mt-margin-desktop">
            <p className="font-body-sm text-body-sm text-on-surface-variant italic mb-4">
              "Equinox transformed my billing workflow from a chore into a seamless, professional experience. The dark mode aesthetic is just a bonus."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-high"></div>
              <div className="font-label-md text-label-md text-on-surface">Sarah J., Independent Consultant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Split: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-gutter lg:p-margin-desktop bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Header (Hidden on md+) */}
          <div className="md:hidden text-center mb-10">
            <div className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface mb-2">Equinox</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Command your finances.</p>
          </div>
          
          <div className="glass-panel rounded-xl p-8 shadow-lg animate-fade-in">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="font-label-md text-label-md text-primary font-bold">Account Info</span>
                <span className="font-label-md text-label-md text-on-surface-variant">Step 1 of 1</span>
              </div>
              <div className="w-full h-[4px] bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary w-full rounded-full"></div>
              </div>
            </div>

            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Create your account</h2>
            
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="jane@example.com"
                  required
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="company">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={company}
                  onChange={onChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Freelance Corp"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded px-4 py-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">Must be at least 8 characters.</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-label-md text-label-md py-3 px-6 rounded transition-colors duration-200 flex justify-center items-center cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Get Started'}
                {!isLoading && <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary-container transition-colors font-bold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
