import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { MdFitnessCenter } from 'react-icons/md';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const strength = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const s = strength(form.password);
  const strengthColors = ['#E74C3C','#F39C12','#F1C40F','#C9A84C'];
  const strengthLabels = ['Weak','Fair','Good','Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try { await register(form.name, form.email, form.password); toast.success('Welcome to FitForge! 🎉'); navigate('/plans'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try { await googleLogin(credentialResponse.credential); toast.success('Account created with Google! 🎉'); navigate('/plans'); }
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
          <h1 className="text-2xl font-bold text-jet mb-2">Create your account</h1>
          <p className="text-jet/40 text-sm">Start your fitness journey today</p>
        </div>

        <div className="bg-white border border-jet/8 rounded-2xl p-8 shadow-sm">
          <div className="mb-6">
            {googleLoading ? (
              <div className="w-full flex items-center justify-center gap-3 border border-jet/10 rounded-xl py-3 px-4 text-sm text-jet/40">
                <div className="w-4 h-4 border-2 border-jet/20 border-t-jet rounded-full animate-spin" /> Connecting with Google…
              </div>
            ) : (
              <div className="flex justify-center [&>div]:w-full [&>div>div]:w-full [&>div>div>div]:w-full">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Google sign-up failed.')} theme="outline" shape="rectangular" size="large" text="signup_with" width="100%" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-jet/8" />
            <span className="text-jet/30 text-xs">OR REGISTER WITH EMAIL</span>
            <div className="flex-1 h-px bg-jet/8" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <div className="relative"><FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-jet/30" size={16} /><input type="text" required autoComplete="name" className="input pl-11" placeholder="John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-jet/30" size={16} /><input type="email" required autoComplete="email" className="input pl-11" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-jet/30" size={16} />
                <input type={showPass ? 'text' : 'password'} required className="input pl-11 pr-11" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-jet/30 hover:text-jet/60">{showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-1">
                  {[0,1,2,3].map(i => <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: i < s ? strengthColors[s-1] : 'rgba(17,17,17,0.1)' }} />)}
                  <span className="text-xs ml-2" style={{ color: strengthColors[s-1] }}>{strengthLabels[s-1] || ''}</span>
                </div>
              )}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-jet/30" size={16} />
                <input type="password" required className={`input pl-11 ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-400' : ''}`} placeholder="Repeat your password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} />
                {form.confirmPassword && form.password === form.confirmPassword && <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2" size={16} style={{ color: '#C9A84C' }} />}
              </div>
            </div>
            <p className="text-xs text-jet/30 leading-relaxed">By creating an account, you agree to our <a href="#" className="text-jet/50 hover:underline">Terms</a> and <a href="#" className="text-jet/50 hover:underline">Privacy Policy</a>.</p>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Creating account…' : 'Create Free Account'}</button>
          </form>

          <p className="text-center text-jet/40 text-sm mt-6">
            Already have an account? <Link to="/login" className="font-semibold hover:underline" style={{ color: '#C9A84C' }}>Sign in</Link>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-jet/40">
          {['✓ Free first week', '✓ Cancel anytime', '✓ No credit card needed'].map(b => (
            <div key={b} className="bg-white border border-jet/8 rounded-xl py-3 px-2">{b}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
