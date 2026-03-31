import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiAlertCircle, FiPlus, FiX } from 'react-icons/fi';
import { MdFitnessCenter } from 'react-icons/md';
import { format, isAfter } from 'date-fns';

const GOLD = '#C9A84C';

const STATUS_STYLES = {
  confirmed: { bg: '#C9A84C15', color: GOLD,      label: 'Confirmed' },
  cancelled: { bg: '#E74C3C15', color: '#E74C3C',  label: 'Cancelled' },
  completed: { bg: 'rgba(17,17,17,0.06)', color: 'rgba(17,17,17,0.40)', label: 'Completed' },
  no_show:   { bg: '#F39C1215', color: '#F39C12',  label: 'No Show' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    api.get('/bookings?limit=20')
      .then(res => setBookings(res.data.bookings))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter(b => b.status === 'confirmed' && isAfter(new Date(b.date), new Date()));
  const past     = bookings.filter(b => b.status !== 'confirmed' || !isAfter(new Date(b.date), new Date()));

  const handleCancel = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const sub = user?.subscription;
  const hasActiveSub = sub?.status === 'active' && sub?.endDate && new Date(sub.endDate) > new Date();
  const hasPendingSub = sub?.status === 'pending';
  const daysLeft = hasActiveSub ? Math.ceil((new Date(sub.endDate) - new Date()) / 86400000) : 0;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="mb-10">
          <p className="text-jet/40 text-sm mb-1">Welcome back,</p>
          <h1 className="font-display text-5xl md:text-6xl text-jet">{user?.name?.toUpperCase()}</h1>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: 'Membership',
              value: hasActiveSub ? sub.planName : hasPendingSub ? 'Pending' : 'None',
              sub: hasActiveSub ? `${daysLeft} days left` : hasPendingSub ? 'Awaiting cash payment' : 'No active plan',
              valueColor: hasActiveSub ? GOLD : hasPendingSub ? '#F39C12' : 'rgba(17,17,17,0.30)',
            },
            { label: 'Upcoming',      value: upcoming.length, sub: 'Sessions booked',  valueColor: GOLD },
            { label: 'Total Sessions',value: bookings.filter(b => b.status !== 'cancelled').length, sub: 'All time', valueColor: '#111111' },
            { label: 'Member Since',  value: format(new Date(user?.createdAt || Date.now()), 'MMM yy'), sub: user?.role, valueColor: '#111111' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-jet/8 rounded-2xl p-6 shadow-sm">
              <p className="text-jet/40 text-xs uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.valueColor }}>{s.value}</p>
              <p className="text-jet/30 text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── No subscription alert ─────────────────────────────────── */}
        {!hasActiveSub && !hasPendingSub && (
          <div className="flex items-center gap-4 bg-white border border-jet/8 rounded-2xl p-5 mb-8 shadow-sm">
            <FiAlertCircle style={{ color: GOLD }} size={20} className="flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-jet">No active membership</p>
              <p className="text-jet/40 text-sm">Subscribe to a plan to start booking sessions.</p>
            </div>
            <Link to="/plans" className="btn-primary text-sm py-2 px-5 flex-shrink-0">View Plans</Link>
          </div>
        )}

        {/* ── Pending cash alert ────────────────────────────────────── */}
        {hasPendingSub && (
          <div className="flex items-center gap-4 bg-white border-2 rounded-2xl p-5 mb-8 shadow-sm" style={{ borderColor: `${GOLD}40` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}15` }}>
              <span className="text-lg">⏳</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-jet">Cash payment pending — {sub.planName}</p>
              <p className="text-jet/40 text-sm">Visit the gym and pay <span className="font-bold text-jet">${sub.amount}</span> to activate your membership.</p>
            </div>
            <Link to="/plans" className="text-sm font-semibold px-4 py-2 rounded-xl border-2 flex-shrink-0" style={{ borderColor: GOLD, color: GOLD }}>
              Change Plan
            </Link>
          </div>
        )}

        {/* ── Active subscription card ──────────────────────────────── */}
        {hasActiveSub && (
          <div className="relative bg-jet rounded-2xl p-6 mb-8 overflow-hidden">
            <div className="absolute inset-0 hero-grid opacity-10" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-cream/40 uppercase tracking-widest mb-1">Active Membership</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-bold" style={{ color: GOLD }}>{sub.planName}</h2>
                  <span className="text-sm text-cream/30">· ${sub.amount}/mo</span>
                </div>
                <p className="text-sm text-cream/40 mt-1">
                  Expires {format(new Date(sub.endDate), 'MMMM d, yyyy')} · {daysLeft} days remaining
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/plans" className="text-sm font-semibold px-4 py-2 rounded-xl border border-cream/20 text-cream hover:border-cream/40 transition-colors">Upgrade</Link>
                <Link to="/book"  className="text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2" style={{ background: GOLD, color: '#fff' }}>
                  <FiPlus size={14} /> Book Class
                </Link>
              </div>
            </div>
            {/* Progress bar */}
            <div className="relative mt-5">
              <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(245,240,232,0.10)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%`, background: GOLD }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Bookings Tabs ─────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white border border-jet/8 rounded-xl p-1 w-fit mb-6 shadow-sm">
          {['upcoming', 'history'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
              style={tab === t
                ? { background: '#111111', color: '#F5F0E8' }
                : { color: 'rgba(17,17,17,0.45)' }}
            >
              {t} {t === 'upcoming' ? `(${upcoming.length})` : ''}
            </button>
          ))}
        </div>

        {/* ── Bookings List ─────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : (tab === 'upcoming' ? upcoming : past).length === 0 ? (
          <div className="bg-white border border-jet/8 rounded-2xl p-16 text-center shadow-sm">
            <MdFitnessCenter size={40} className="mx-auto mb-4" style={{ color: 'rgba(17,17,17,0.10)' }} />
            <p className="text-jet/30 text-sm">
              {tab === 'upcoming' ? 'No upcoming sessions. Ready to book your next class?' : 'No booking history yet.'}
            </p>
            {tab === 'upcoming' && (
              <Link to="/book" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
                <FiPlus size={14} /> Book a Session
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {(tab === 'upcoming' ? upcoming : past).map(booking => {
              const st = STATUS_STYLES[booking.status] || STATUS_STYLES.completed;
              return (
                <div key={booking._id} className="bg-white border border-jet/8 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-jet/15 transition-colors">
                  {/* Date block */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center" style={{ background: `${GOLD}12`, border: `1.5px solid ${GOLD}25` }}>
                    <p className="font-display text-lg leading-none" style={{ color: GOLD }}>{format(new Date(booking.date), 'd')}</p>
                    <p className="text-jet/40 text-xs uppercase">{format(new Date(booking.date), 'MMM')}</p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-jet truncate">{booking.className}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-jet/40 flex-wrap">
                      <span className="flex items-center gap-1"><FiClock size={11} /> {booking.startTime}–{booking.endTime}</span>
                      <span className="flex items-center gap-1"><FiCalendar size={11} /> {booking.trainerName}</span>
                    </div>
                  </div>

                  {/* Code + Status + Cancel */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-jet/30">Code</p>
                      <p className="text-xs font-mono font-bold" style={{ color: GOLD }}>{booking.confirmationCode}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    {booking.status === 'confirmed' && tab === 'upcoming' && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancellingId === booking._id}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: 'rgba(17,17,17,0.25)' }}
                        title="Cancel booking"
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
