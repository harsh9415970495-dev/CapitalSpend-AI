import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="w-full max-w-[440px] relative z-10 animate-fadeIn">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6 ring-4 ring-white/5">
             <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Smart<span className="text-blue-500">Spend</span>
          </h1>
          <p className="text-slate-400 font-medium mt-2">Intelligence for your capital</p>
        </div>

        {/* Main Card */}
        <div className="glass-card p-8 md:p-10 border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-1">Please enter your credentials to continue.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm font-semibold flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="input-premium pl-12 w-full bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 focus:bg-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <Link to="#" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-premium pl-12 w-full bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 focus:bg-slate-900"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3 ml-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
              <label htmlFor="remember" className="text-sm text-slate-400 font-medium cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full flex items-center justify-center gap-3 py-4 text-sm font-black uppercase tracking-widest"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Social Login Mock (Visual Only) */}
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Or continue with</p>
            <div className="flex gap-4 w-full">
               <button className="flex-1 py-3 px-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                 <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
               </button>
               <button className="flex-1 py-3 px-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                 <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
               </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white font-bold hover:text-blue-500 transition-all inline-flex items-center gap-1 group">
              Create Account
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;