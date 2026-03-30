import { useState, useEffect } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { FiMapPin, FiCheck, FiX, FiRefreshCw } from "react-icons/fi";
import { format } from "date-fns";

export default function CashRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/payments/pending-cash")
      .then((res) => setRequests(res.data.users))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleActivate = async (userId, userName) => {
    setActionId(userId);
    try {
      await api.post(`/payments/activate-cash/${userId}`);
      toast.success(`Membership activated for ${userName}!`);
      setRequests((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (userId, userName) => {
    if (!confirm(`Cancel cash request for ${userName}?`)) return;
    setActionId(userId + "-reject");
    try {
      await api.delete(`/payments/cancel-cash/${userId}`);
      toast.success(`Cancelled cash request for ${userName}.`);
      setRequests((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center">
            <FiMapPin size={16} className="text-orange" />
          </div>
          <div>
            <h3 className="font-bold">Cash on Visit Requests</h3>
            <p className="text-white/40 text-xs">
              Activate after receiving cash payment at the gym
            </p>
          </div>
          {requests.length > 0 && (
            <span className="ml-2 px-2.5 py-1 bg-orange/10 border border-orange/20 text-orange text-xs font-bold rounded-full">
              {requests.length} pending
            </span>
          )}
        </div>
        <button
          onClick={load}
          className="p-2 text-white/30 hover:text-white transition-colors"
        >
          <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="card p-10 text-center">
          <FiMapPin size={28} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No pending cash requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((u) => (
            <div
              key={u._id}
              className="card p-5 flex items-center gap-4 border-orange/10"
            >
              <div className="w-10 h-10 rounded-full bg-orange/10 border border-orange/20 flex items-center justify-center flex-shrink-0">
                <span className="text-orange font-bold text-sm">
                  {u.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{u.name}</p>
                <p className="text-white/40 text-xs truncate">{u.email}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-orange font-semibold">
                    {u.subscription?.planName}
                  </span>
                  <span className="text-white/30 text-xs">
                    · ${u.subscription?.amount}
                  </span>
                  <span className="text-white/30 text-xs">
                    · Requested {format(new Date(u.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
              <div className="hidden sm:block text-center px-4">
                <p className="text-xl font-bold text-orange">
                  ${u.subscription?.amount}
                </p>
                <p className="text-white/30 text-xs">to collect</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleActivate(u._id, u.name)}
                  disabled={actionId === u._id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon/10 border border-neon/20 text-neon text-xs font-bold hover:bg-neon/20 transition-colors disabled:opacity-50"
                >
                  <FiCheck size={13} />
                  {actionId === u._id ? "Activating…" : "Activate"}
                </button>
                <button
                  onClick={() => handleReject(u._id, u.name)}
                  disabled={actionId === u._id + "-reject"}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-white/40 text-xs hover:border-red-500/30 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <FiX size={13} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
