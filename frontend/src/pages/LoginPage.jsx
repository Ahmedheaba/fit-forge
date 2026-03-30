import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { MdFitnessCenter } from 'react-icons/md';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await login(form.email, form.password); toast.success('Welcome back!'); navigate('/dashboard'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try { await googleLogin(credentialResponse.credential); toast.success('Signed in with Google!'); navigate('/dashboard'); }
    catch (err) { toast.error(err.message); }
    finally { setGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-jet rounded-xl flex items-center justify-center">
              <MdFitnessCenter className="text-cream text-xl" />
            </div>
            <span className="font-display text-3xl text-jet">FIT<span style={{ color: '#C9A84C' }}>FORGE</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-jet mb-2">Welcome back</h1>
          <p className="text-jet/40 text-sm">Sign in to your account to continue</p>
        </div>

        <div className="bg-white border border-jet/8 rounded-2xl p-8 shadow-sm">
          <div className="mb-6">
            {googleLoading ? (
              <div className="w-full flex items-center justify-center gap-3 border border-jet/10 rounded-xl py-3 px-4 text-sm text-jet/40">
                <div className="w-4 h-4 border-2 border-jet/20 border-t-jet rounded-full animate-spin" />
                Signing in with Google…
              </div>
            ) : (
              <div className="flex justify-center [&>div]:w-full [&>div>div]:w-full [&>div>div>div]:w-full">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Google sign-in failed.')} theme="outline" shape="rectangular" size="large" text="signin_with" width="100%" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-jet/8" />
            <span className="text-jet/30 text-xs">OR SIGN IN WITH EMAIL</span>
            <div className="flex-1 h-px bg-jet/8" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-jet/30" size={16} />
                <input type="email" required autoComplete="email" className="input pl-11" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-jet/30" size={16} />
                <input type={showPass ? 'text' : 'password'} required autoComplete="current-password" className="input pl-11 pr-11" placeholder="Your password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-jet/30 hover:text-jet/60">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-jet/40 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: '#C9A84C' }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
