import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiSave, FiLock, FiBell } from 'react-icons/fi';

const FITNESS_GOALS = [
  { value: '', label: 'Select a goal' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'general_fitness', label: 'General Fitness' },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    fitnessGoal: user?.fitnessGoal || '',
    emailNotifications: user?.emailNotifications ?? true,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/users/profile', profile);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    setSaving(true);
    try {
      await api.patch('/users/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="mb-10">
        <p className="text-neon text-xs font-semibold uppercase tracking-widest mb-2">Account</p>
        <h1 className="font-display text-5xl md:text-6xl">YOUR PROFILE</h1>
      </div>

      {/* Avatar + Info */}
      <div className="card p-6 flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-neon/10 border border-neon/20 flex items-center justify-center">
              <span className="text-neon text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-lg">{user?.name}</p>
          <p className="text-white/40 text-sm">{user?.email}</p>
          <span className="inline-block mt-1 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neon/10 text-neon border border-neon/20">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-100 rounded-xl p-1 w-fit mb-8">
        {[
          { id: 'profile', icon: FiUser, label: 'Profile' },
          { id: 'security', icon: FiLock, label: 'Security' },
          { id: 'notifications', icon: FiBell, label: 'Notifications' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.id ? 'bg-neon text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="card p-8 space-y-6">
          <div>
            <label className="label flex items-center gap-2"><FiUser size={13} /> Full Name</label>
            <input
              className="input"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label flex items-center gap-2"><FiMail size={13} /> Email Address</label>
            <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
            <p className="text-xs text-white/30 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="label flex items-center gap-2"><FiPhone size={13} /> Phone Number</label>
            <input
              className="input"
              type="tel"
              placeholder="+20 123 456 789"
              value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Fitness Goal</label>
            <select
              className="input bg-dark-200"
              value={profile.fitnessGoal}
              onChange={e => setProfile(p => ({ ...p, fitnessGoal: e.target.value }))}
            >
              {FITNESS_GOALS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            <FiSave size={15} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <form onSubmit={handlePasswordSave} className="card p-8 space-y-6">
          {user?.googleId && !user?.password ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🔐</p>
              <p className="text-white/50 text-sm">You signed in with Google. Password management is handled by Google.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password" required className="input"
                  placeholder="Your current password"
                  value={passwords.currentPassword}
                  onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password" required className="input"
                  placeholder="Min. 6 characters"
                  value={passwords.newPassword}
                  onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password" required className="input"
                  placeholder="Repeat new password"
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                <FiLock size={15} />
                {saving ? 'Updating…' : 'Change Password'}
              </button>
            </>
          )}
        </form>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div className="card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Booking Confirmations</p>
              <p className="text-white/40 text-xs mt-0.5">Receive email when you book or cancel a session</p>
            </div>
            <button
              onClick={() => {
                const newVal = !profile.emailNotifications;
                setProfile(p => ({ ...p, emailNotifications: newVal }));
                api.patch('/users/profile', { emailNotifications: newVal })
                  .then(() => { updateUser({ emailNotifications: newVal }); toast.success('Preference saved.'); })
                  .catch(err => toast.error(err.message));
              }}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${profile.emailNotifications ? 'bg-neon' : 'bg-white/10'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${profile.emailNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between opacity-50">
            <div>
              <p className="font-semibold text-sm">Class Reminders</p>
              <p className="text-white/40 text-xs mt-0.5">Get reminded 1 hour before your session</p>
            </div>
            <div className="w-11 h-6 rounded-full bg-white/10 relative">
              <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white/30 rounded-full shadow" />
            </div>
          </div>

          <div className="flex items-center justify-between opacity-50">
            <div>
              <p className="font-semibold text-sm">Membership Renewal</p>
              <p className="text-white/40 text-xs mt-0.5">Notified 7 days before membership expires</p>
            </div>
            <div className="w-11 h-6 rounded-full bg-neon relative">
              <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
            </div>
          </div>

          <p className="text-xs text-white/20 pt-2 border-t border-white/5">
            SMS and push notification support coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
