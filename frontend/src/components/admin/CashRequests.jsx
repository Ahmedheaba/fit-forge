import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';

const GOLD = '#C9A84C';

export default function CashRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/payments/pending-cash')
      .then(res => setRequests(res.data.users))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleActivate = async (userId, userName) => {
    setActionId(userId);
    try {
      await api.post(`/payments/activate-cash/${userId}`);
      toast.success(`Membership activated for ${userName}!`);
      setRequests(prev => prev.filter(u => u._id !== userId));
    } catch (err) { toast.error(err.message); }
    finally { setActionId(null); }
  };

  const handleReject = async (userId, userName) => {
    if (!confirm(`Cancel cash request for ${userName}?`)) return;
    setActionId(userId + '-reject');
    try {
      await api.delete(`/payments/cancel-cash/${userId}`);
      toast.success(`Cancelled cash request for ${userName}.`);
      setRequests(prev => prev.filter(u => u._id !== userId));
    } catch (err) { toast.error(err.message); }
    finally { setActionId(null); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}15`, border: `1.5px solid ${GOLD}30` }}>
            <FiMapPin size={16} style={{ color: GOLD }} />
          </div>
          <div>
            <h3 className="font-bold text-jet">Cash on Visit Requests</h3>
            <p className="text-jet/40 text-xs">Activate after receiving cash payment at the gym</p>
          </div>
          {requests.length > 0 && (
            <span className="ml-2 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: `${GOLD}15`, color: GOLD }}>
              {requests.length} pending
            </span>
          )}
        </div>
        <button onClick={load} className="p-2 text-jet/30 hover:text-jet transition-colors rounded-lg hover:bg-cream-2" title="Refresh">
          <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-jet/8 rounded-2xl p-12 text-center shadow-sm">
          <FiMapPin size={28} className="mx-auto mb-3" style={{ color: 'rgba(17,17,17,0.12)' }} />
          <p className="text-jet/30 text-sm">No pending cash requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(u => (
            <div key={u._id} className="bg-white border border-jet/8 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-jet/15 transition-colors"
              style={{ borderLeft: `3px solid ${GOLD}` }}>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}15` }}>
                <span className="font-bold text-sm" style={{ color: GOLD }}>{u.name?.[0]?.toUpperCase()}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-jet">{u.name}</p>
                <p className="text-jet/40 text-xs truncate">{u.email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-semibold" style={{ color: GOLD }}>{u.subscription?.planName}</span>
                  <span className="text-jet/20 text-xs">·</span>
                  <span className="text-jet/30 text-xs">Requested {format(new Date(u.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="hidden sm:block text-center px-4">
                <p className="text-2xl font-bold" style={{ color: GOLD }}>${u.subscription?.amount}</p>
                <p className="text-jet/30 text-xs">to collect</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleActivate(u._id, u.name)}
                  disabled={actionId === u._id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  style={{ background: `${GOLD}15`, color: GOLD, border: `1.5px solid ${GOLD}30` }}
                >
                  <FiCheck size={13} />
                  {actionId === u._id ? 'Activating…' : 'Activate'}
                </button>
                <button
                  onClick={() => handleReject(u._id, u.name)}
                  disabled={actionId === u._id + '-reject'}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-jet/10 text-jet/40 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <FiX size={13} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
