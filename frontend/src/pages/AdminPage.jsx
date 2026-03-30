import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import {
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiActivity,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiMapPin,
} from "react-icons/fi";
import { MdFitnessCenter } from "react-icons/md";
import { format } from "date-fns";
import CashRequests from "../components/admin/CashRequests";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AdminPage() {
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [plans, setPlans] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: { value: 1, unit: "month" },
    features: "",
    category: "standard",
    maxBookingsPerMonth: "",
    isPopular: false,
    isActive: true,
  });
  const [editingPlan, setEditingPlan] = useState(null);
  const [showPlanForm, setShowPlanForm] = useState(false);

  const [classForm, setClassForm] = useState({
    name: "",
    description: "",
    category: "hiit",
    "trainer.name": "",
    duration: 60,
    maxCapacity: 20,
    difficulty: "all_levels",
    room: "Studio A",
  });
  const [showClassForm, setShowClassForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "dashboard") {
        const res = await api.get("/admin/dashboard");
        setStats(res.data);
      } else if (tab === "users") {
        const res = await api.get(`/admin/users?search=${search}&limit=30`);
        setUsers(res.data.users);
      } else if (tab === "bookings") {
        const res = await api.get("/admin/bookings?limit=30");
        setBookings(res.data.bookings);
      } else if (tab === "plans") {
        const res = await api.get("/plans");
        setPlans(res.data.plans);
      } else if (tab === "classes") {
        const res = await api.get("/classes");
        setClasses(res.data.classes);
      }
      // cash tab is handled inside CashRequests component itself
    } catch (err) {
      toast.error("Failed to load data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...planForm,
        price: Number(planForm.price),
        maxBookingsPerMonth: planForm.maxBookingsPerMonth
          ? Number(planForm.maxBookingsPerMonth)
          : null,
        features: planForm.features.split("\n").filter(Boolean),
      };
      if (editingPlan) {
        await api.put(`/plans/${editingPlan._id}`, payload);
        toast.success("Plan updated!");
      } else {
        await api.post("/plans", payload);
        toast.success("Plan created!");
      }
      setShowPlanForm(false);
      setEditingPlan(null);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!confirm("Deactivate this plan?")) return;
    try {
      await api.delete(`/plans/${id}`);
      toast.success("Plan deactivated.");
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditPlan = (plan) => {
    setPlanForm({
      ...plan,
      features: plan.features?.join("\n") || "",
      maxBookingsPerMonth: plan.maxBookingsPerMonth || "",
    });
    setEditingPlan(plan);
    setShowPlanForm(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: classForm.name,
        description: classForm.description,
        category: classForm.category,
        trainer: { name: classForm["trainer.name"] },
        duration: Number(classForm.duration),
        maxCapacity: Number(classForm.maxCapacity),
        difficulty: classForm.difficulty,
        room: classForm.room,
        schedule: [],
      };
      await api.post("/classes", payload);
      toast.success("Class created!");
      setShowClassForm(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await api.patch(`/admin/bookings/${id}`, { status });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b)),
      );
      toast.success("Booking updated.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleUser = async (userId, isActive) => {
    try {
      await api.patch(`/admin/users/${userId}`, { isActive });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive } : u)),
      );
      toast.success(isActive ? "User activated." : "User deactivated.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: FiActivity },
    { id: "cash", label: "Cash Requests", icon: FiMapPin },
    { id: "users", label: "Users", icon: FiUsers },
    { id: "bookings", label: "Bookings", icon: FiCalendar },
    { id: "plans", label: "Plans", icon: FiDollarSign },
    { id: "classes", label: "Classes", icon: MdFitnessCenter },
  ];

  const chartData =
    stats?.monthlyTrend?.map((d) => ({
      name: MONTH_NAMES[d._id.month - 1],
      bookings: d.count,
    })) || [];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-neon text-xs font-semibold uppercase tracking-widest mb-1">
              Admin
            </p>
            <h1 className="font-display text-5xl">CONTROL PANEL</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-neon/10 border border-neon/20 rounded-xl px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            <span className="text-neon text-xs font-semibold">Admin Mode</span>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-dark-100 rounded-xl p-1 mb-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setSearch("");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                tab === t.id
                  ? "bg-neon text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ─────────────────────────────────────────────── */}
        {tab === "dashboard" && (
          <div className="space-y-8">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-28 rounded-2xl" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Members",
                      value: stats?.stats?.totalUsers?.toLocaleString(),
                      sub: `+${stats?.stats?.newUsersThisMonth} this month`,
                      icon: FiUsers,
                      color: "#39FF14",
                    },
                    {
                      label: "Total Bookings",
                      value: stats?.stats?.totalBookings?.toLocaleString(),
                      sub: `+${stats?.stats?.bookingsThisMonth} this month`,
                      icon: FiCalendar,
                      color: "#3498DB",
                    },
                    {
                      label: "Active Subs",
                      value:
                        stats?.stats?.activeSubscriptions?.toLocaleString(),
                      sub: "Paying members",
                      icon: FiActivity,
                      color: "#FF6B00",
                    },
                    {
                      label: "Monthly Revenue",
                      value: `$${stats?.stats?.monthlyRevenue?.toLocaleString()}`,
                      sub: "From new subscriptions",
                      icon: FiDollarSign,
                      color: "#9B59B6",
                    },
                  ].map((s) => (
                    <div key={s.label} className="stat-card">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white/40 text-xs uppercase tracking-widest">
                          {s.label}
                        </p>
                        <s.icon size={16} style={{ color: s.color }} />
                      </div>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: s.color }}
                      >
                        {s.value}
                      </p>
                      <p className="text-xs text-white/30 mt-1">{s.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="font-semibold text-sm mb-6 text-white/60 uppercase tracking-widest">
                      Monthly Bookings
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#ffffff08"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#666", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#666", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="bookings"
                          stroke="#39FF14"
                          strokeWidth={2}
                          dot={{ fill: "#39FF14", strokeWidth: 0, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card p-6">
                    <h3 className="font-semibold text-sm mb-6 text-white/60 uppercase tracking-widest">
                      Popular Classes
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={stats?.popularClasses?.map((c) => ({
                          name: c._id.slice(0, 12),
                          count: c.count,
                        }))}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#ffffff08"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#666", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#666", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: 12,
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#39FF14"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-sm mb-5 text-white/60 uppercase tracking-widest">
                    Recent Bookings
                  </h3>
                  <div className="space-y-3">
                    {stats?.recentBookings?.map((b) => (
                      <div
                        key={b._id}
                        className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-neon/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-neon text-xs font-bold">
                            {b.user?.name?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {b.user?.name}
                          </p>
                          <p className="text-xs text-white/30">
                            {b.className} · {format(new Date(b.date), "MMM d")}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            b.status === "confirmed"
                              ? "bg-neon/10 text-neon"
                              : "bg-white/5 text-white/40"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── CASH REQUESTS ─────────────────────────────────────────── */}
        {tab === "cash" && <CashRequests />}

        {/* ── USERS ─────────────────────────────────────────────────── */}
        {tab === "users" && (
          <div>
            <div className="flex gap-4 mb-6">
              <input
                className="input flex-1 max-w-sm"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadData()}
              />
              <button
                onClick={loadData}
                className="btn-primary text-sm py-2 px-5"
              >
                Search
              </button>
            </div>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {[
                        "Member",
                        "Role",
                        "Membership",
                        "Joined",
                        "Status",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-12 text-white/30"
                        >
                          Loading…
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr
                          key={u._id}
                          className="border-b border-white/5 hover:bg-white/2 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neon/10 flex items-center justify-center flex-shrink-0">
                                {u.avatar ? (
                                  <img
                                    src={u.avatar}
                                    alt=""
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-neon text-xs font-bold">
                                    {u.name?.[0]}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{u.name}</p>
                                <p className="text-white/30 text-xs">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`badge ${u.role === "admin" ? "bg-orange/10 text-orange border border-orange/20" : "bg-white/5 text-white/50"}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {u.subscription?.status === "active" && (
                              <span className="text-neon text-xs font-semibold">
                                {u.subscription.planName}
                              </span>
                            )}
                            {u.subscription?.status === "pending" && (
                              <span className="text-orange text-xs font-semibold">
                                ⏳ {u.subscription.planName} (Cash)
                              </span>
                            )}
                            {(!u.subscription?.status ||
                              u.subscription?.status === "none") && (
                              <span className="text-white/20 text-xs">
                                None
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-white/30 text-xs">
                            {format(new Date(u.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`badge ${u.isActive ? "bg-neon/10 text-neon" : "bg-red-500/10 text-red-400"}`}
                            >
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() =>
                                handleToggleUser(u._id, !u.isActive)
                              }
                              className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
                                u.isActive
                                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  : "border-neon/30 text-neon hover:bg-neon/10"
                              }`}
                            >
                              {u.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── BOOKINGS ──────────────────────────────────────────────── */}
        {tab === "bookings" && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {[
                      "Member",
                      "Class",
                      "Date & Time",
                      "Code",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-12 text-white/30"
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr
                        key={b._id}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium">{b.user?.name}</p>
                          <p className="text-white/30 text-xs">
                            {b.user?.email}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium">{b.className}</p>
                          <p className="text-white/30 text-xs">
                            {b.trainerName}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-xs text-white/50">
                          {format(new Date(b.date), "MMM d, yyyy")}
                          <br />
                          {b.startTime} – {b.endTime}
                        </td>
                        <td className="px-5 py-4 font-mono text-neon text-xs">
                          {b.confirmationCode}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`badge capitalize text-xs ${
                              b.status === "confirmed"
                                ? "bg-neon/10 text-neon"
                                : b.status === "cancelled"
                                  ? "bg-red-500/10 text-red-400"
                                  : b.status === "completed"
                                    ? "bg-white/5 text-white/40"
                                    : "bg-orange/10 text-orange"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {b.status === "confirmed" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateBookingStatus(b._id, "completed")
                                }
                                className="p-1.5 text-neon hover:bg-neon/10 rounded-lg transition-colors"
                                title="Mark completed"
                              >
                                <FiCheck size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateBookingStatus(b._id, "cancelled")
                                }
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PLANS ─────────────────────────────────────────────────── */}
        {tab === "plans" && (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setPlanForm({
                    name: "",
                    description: "",
                    price: "",
                    duration: { value: 1, unit: "month" },
                    features: "",
                    category: "standard",
                    maxBookingsPerMonth: "",
                    isPopular: false,
                    isActive: true,
                  });
                  setEditingPlan(null);
                  setShowPlanForm(true);
                }}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <FiPlus size={14} /> Add Plan
              </button>
            </div>

            {showPlanForm && (
              <form
                onSubmit={handleSavePlan}
                className="card p-6 mb-6 space-y-4"
              >
                <h3 className="font-bold text-lg">
                  {editingPlan ? "Edit Plan" : "New Plan"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Plan Name</label>
                    <input
                      className="input"
                      required
                      value={planForm.name}
                      onChange={(e) =>
                        setPlanForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Price ($)</label>
                    <input
                      type="number"
                      className="input"
                      required
                      value={planForm.price}
                      onChange={(e) =>
                        setPlanForm((p) => ({ ...p, price: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Duration Value</label>
                    <input
                      type="number"
                      className="input"
                      required
                      value={planForm.duration?.value}
                      onChange={(e) =>
                        setPlanForm((p) => ({
                          ...p,
                          duration: { ...p.duration, value: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Duration Unit</label>
                    <select
                      className="input bg-dark-200"
                      value={planForm.duration?.unit}
                      onChange={(e) =>
                        setPlanForm((p) => ({
                          ...p,
                          duration: { ...p.duration, unit: e.target.value },
                        }))
                      }
                    >
                      {["day", "week", "month", "year"].map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select
                      className="input bg-dark-200"
                      value={planForm.category}
                      onChange={(e) =>
                        setPlanForm((p) => ({ ...p, category: e.target.value }))
                      }
                    >
                      {[
                        "basic",
                        "standard",
                        "premium",
                        "personal_training",
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      Max Bookings/Month (blank = unlimited)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={planForm.maxBookingsPerMonth}
                      onChange={(e) =>
                        setPlanForm((p) => ({
                          ...p,
                          maxBookingsPerMonth: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows={2}
                    required
                    value={planForm.description}
                    onChange={(e) =>
                      setPlanForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Features (one per line)</label>
                  <textarea
                    className="input"
                    rows={5}
                    placeholder="Unlimited gym access&#10;All classes included"
                    value={planForm.features}
                    onChange={(e) =>
                      setPlanForm((p) => ({ ...p, features: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={planForm.isPopular}
                    onChange={(e) =>
                      setPlanForm((p) => ({
                        ...p,
                        isPopular: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-neon"
                  />
                  <label htmlFor="popular" className="text-sm text-white/60">
                    Mark as Most Popular
                  </label>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary text-sm">
                    Save Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPlanForm(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map((plan) => (
                <div key={plan._id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold">{plan.name}</p>
                      <p className="text-neon font-display text-2xl">
                        ${plan.price}
                        <span className="text-white/30 text-sm font-sans">
                          /{plan.duration?.unit}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan._id)}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/5 rounded-lg"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-white/40 mb-3">
                    {plan.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {plan.isPopular && (
                      <span className="badge bg-neon/10 text-neon text-xs">
                        Popular
                      </span>
                    )}
                    <span
                      className={`badge text-xs ${plan.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLASSES ───────────────────────────────────────────────── */}
        {tab === "classes" && (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowClassForm(!showClassForm)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <FiPlus size={14} /> Add Class
              </button>
            </div>

            {showClassForm && (
              <form
                onSubmit={handleSaveClass}
                className="card p-6 mb-6 space-y-4"
              >
                <h3 className="font-bold text-lg">New Class</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Class Name</label>
                    <input
                      className="input"
                      required
                      value={classForm.name}
                      onChange={(e) =>
                        setClassForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Trainer Name</label>
                    <input
                      className="input"
                      required
                      value={classForm["trainer.name"]}
                      onChange={(e) =>
                        setClassForm((p) => ({
                          ...p,
                          "trainer.name": e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select
                      className="input bg-dark-200"
                      value={classForm.category}
                      onChange={(e) =>
                        setClassForm((p) => ({
                          ...p,
                          category: e.target.value,
                        }))
                      }
                    >
                      {[
                        "hiit",
                        "yoga",
                        "crossfit",
                        "cycling",
                        "boxing",
                        "strength",
                        "pilates",
                        "cardio",
                        "open_gym",
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Difficulty</label>
                    <select
                      className="input bg-dark-200"
                      value={classForm.difficulty}
                      onChange={(e) =>
                        setClassForm((p) => ({
                          ...p,
                          difficulty: e.target.value,
                        }))
                      }
                    >
                      {[
                        "beginner",
                        "intermediate",
                        "advanced",
                        "all_levels",
                      ].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Duration (min)</label>
                    <input
                      type="number"
                      className="input"
                      value={classForm.duration}
                      onChange={(e) =>
                        setClassForm((p) => ({
                          ...p,
                          duration: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Max Capacity</label>
                    <input
                      type="number"
                      className="input"
                      value={classForm.maxCapacity}
                      onChange={(e) =>
                        setClassForm((p) => ({
                          ...p,
                          maxCapacity: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Room</label>
                    <input
                      className="input"
                      value={classForm.room}
                      onChange={(e) =>
                        setClassForm((p) => ({ ...p, room: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    required
                    value={classForm.description}
                    onChange={(e) =>
                      setClassForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary text-sm">
                    Create Class
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClassForm(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((cls) => (
                <div key={cls._id} className="card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="badge bg-white/5 text-white/50 text-xs capitalize">
                      {cls.category}
                    </span>
                    <button
                      onClick={async () => {
                        await api.delete(`/classes/${cls._id}`);
                        toast.success("Class deactivated.");
                        loadData();
                      }}
                      className="p-1.5 text-white/20 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                  <h3 className="font-bold text-sm mb-1">{cls.name}</h3>
                  <p className="text-white/40 text-xs mb-3">
                    with {cls.trainer?.name}
                  </p>
                  <div className="flex gap-3 text-xs text-white/30">
                    <span>{cls.duration} min</span>
                    <span>·</span>
                    <span>Cap: {cls.maxCapacity}</span>
                    <span>·</span>
                    <span>{cls.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
