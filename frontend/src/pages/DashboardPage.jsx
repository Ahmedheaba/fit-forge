import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiPlus,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { MdFitnessCenter } from "react-icons/md";
import { format, isAfter } from "date-fns";

const STATUS_COLORS = {
  confirmed: "#39FF14",
  cancelled: "#ff4444",
  completed: "#888",
  no_show: "#ff8800",
};
const STATUS_BG = {
  confirmed: "#39FF1410",
  cancelled: "#ff444410",
  completed: "#88888810",
  no_show: "#ff880010",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    api
      .get("/bookings?limit=20")
      .then((res) => setBookings(res.data.bookings))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && isAfter(new Date(b.date), new Date()),
  );
  const past = bookings.filter(
    (b) => b.status !== "confirmed" || !isAfter(new Date(b.date), new Date()),
  );

  const handleCancel = async (bookingId) => {
    if (!confirm("Cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b,
        ),
      );
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const sub = user?.subscription;
  const hasActiveSub =
    sub?.status === "active" &&
    sub?.endDate &&
    new Date(sub.endDate) > new Date();
  const daysLeft = hasActiveSub
    ? Math.ceil((new Date(sub.endDate) - new Date()) / 86400000)
    : 0;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-white/40 text-sm mb-1">Welcome back,</p>
        <h1 className="font-display text-5xl md:text-6xl">
          {user?.name?.toUpperCase()}
        </h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="stat-card">
          <p className="text-black/40 text-xs uppercase tracking-widest">
            Membership
          </p>
          <p className="text-2xl font-bold mt-1">
            {hasActiveSub ? (
              <span className="text-neon">{sub.planName}</span>
            ) : (
              <span className="text-black/50">None</span>
            )}
          </p>
          {hasActiveSub && (
            <p className="text-xs text-black/30 mt-1">{daysLeft} days left</p>
          )}
        </div>

        <div className="stat-card">
          <p className="text-black/40 text-xs uppercase tracking-widest">
            Upcoming
          </p>
          <p className="text-2xl font-bold text-neon mt-1">{upcoming.length}</p>
          <p className="text-xs text-black/30 mt-1">Sessions booked</p>
        </div>

        <div className="stat-card">
          <p className="text-black/40 text-xs uppercase tracking-widest">
            Total Sessions
          </p>
          <p className="text-2xl font-bold mt-1">
            {bookings.filter((b) => b.status !== "cancelled").length}
          </p>
          <p className="text-xs text-black/30 mt-1">All time</p>
        </div>

        <div className="stat-card">
          <p className="text-black/40 text-xs uppercase tracking-widest">
            Member Since
          </p>
          <p className="text-2xl font-bold mt-1">
            {format(new Date(user?.createdAt || Date.now()), "MMM yy")}
          </p>
          <p className="text-xs text-black/30 mt-1">{user?.role}</p>
        </div>
      </div>

      {/* Subscription Alert */}
      {!hasActiveSub && (
        <div className="flex items-center gap-4 bg-orange/5 border border-orange/20 rounded-2xl p-5 mb-8">
          <FiAlertCircle className="text-orange flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-sm">No active membership</p>
            <p className="text-white/40 text-sm">
              Subscribe to a plan to start booking sessions.
            </p>
          </div>
          <Link
            to="/plans"
            className="btn-primary text-sm py-2 px-5 flex-shrink-0"
          >
            View Plans
          </Link>
        </div>
      )}

      {/* Subscription Card */}
      {hasActiveSub && (
        <div className="relative card overflow-hidden p-6 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(57,255,20,0.05)_0%,transparent_60%)]" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
                Active Membership
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-neon">{sub.planName}</h2>
                <span className="text-sm text-white/30">
                  · ${sub.amount}/mo
                </span>
              </div>
              <p className="text-sm text-white/40 mt-1">
                Expires {format(new Date(sub.endDate), "MMMM d, yyyy")} ·{" "}
                {daysLeft} days remaining
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/plans" className="btn-secondary text-sm py-2 px-4">
                Upgrade
              </Link>
              <Link
                to="/book"
                className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
              >
                <FiPlus size={14} /> Book Class
              </Link>
            </div>
          </div>
          {/* Progress bar */}
          <div className="relative mt-5">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-neon rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bookings */}
      <div>
        {/* Tabs */}
        <div className="flex gap-1 bg-dark-100 rounded-xl p-1 w-fit mb-6">
          {["upcoming", "history"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                tab === t
                  ? "bg-neon text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {t} {t === "upcoming" ? `(${upcoming.length})` : ""}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : (tab === "upcoming" ? upcoming : past).length === 0 ? (
          <div className="card p-16 text-center">
            <MdFitnessCenter size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-black/30 text-sm">
              {tab === "upcoming"
                ? "No upcoming sessions. Ready to book your next class?"
                : "No booking history yet."}
            </p>
            {tab === "upcoming" && (
              <Link
                to="/book"
                className="btn-primary inline-flex items-center gap-2 mt-4 text-sm"
              >
                <FiPlus size={14} /> Book a Session
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {(tab === "upcoming" ? upcoming : past).map((booking) => (
              <div
                key={booking._id}
                className="card p-5 flex items-center gap-4"
              >
                {/* Date block */}
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/5 flex flex-col items-center justify-center">
                  <p className="text-neon font-display text-lg leading-none">
                    {format(new Date(booking.date), "d")}
                  </p>
                  <p className="text-white/30 text-xs uppercase">
                    {format(new Date(booking.date), "MMM")}
                  </p>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">
                    {booking.className}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-white/30 flex-wrap">
                    <span className="flex items-center gap-1">
                      <FiClock size={11} /> {booking.startTime}–
                      {booking.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar size={11} /> {booking.trainerName}
                    </span>
                  </div>
                </div>

                {/* Status & Code */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:block">
                    <p className="text-xs text-white/30">Code</p>
                    <p className="text-xs font-mono font-bold text-neon">
                      {booking.confirmationCode}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                    style={{
                      background: STATUS_BG[booking.status],
                      color: STATUS_COLORS[booking.status],
                    }}
                  >
                    {booking.status}
                  </span>
                  {booking.status === "confirmed" && tab === "upcoming" && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancellingId === booking._id}
                      className="p-2 text-white/20 hover:text-red-400 transition-colors"
                      title="Cancel booking"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
