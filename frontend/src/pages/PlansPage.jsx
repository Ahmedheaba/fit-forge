import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiCheck, FiZap, FiLoader, FiLock, FiCreditCard, FiMapPin, FiX } from 'react-icons/fi';

const GOLD = '#C9A84C';

function PaymentModal({ plan, onClose, onCard, onCash, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-jet/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border border-jet/10 rounded-2xl p-8 shadow-2xl shadow-jet/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-jet/30 hover:text-jet transition-colors">
          <FiX size={20} />
        </button>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Selected Plan</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-jet">{plan.name}</h2>
            <span className="font-display text-3xl" style={{ color: GOLD }}>${plan.price}</span>
            <span className="text-jet/30 text-sm">/{plan.duration?.unit}</span>
          </div>
        </div>
        <p className="text-jet/50 text-sm mb-6">How would you like to pay?</p>
        <div className="space-y-4">
          <button
            onClick={onCard}
            disabled={loading === 'card'}
            className="w-full flex items-center gap-5 p-5 rounded-2xl border border-jet/10 hover:border-jet/30 hover:bg-cream-2 transition-all duration-200 disabled:opacity-60 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-jet flex items-center justify-center flex-shrink-0">
              {loading === 'card'
                ? <FiLoader size={20} className="text-cream animate-spin" />
                : <FiCreditCard size={20} className="text-cream" />}
            </div>
            <div>
              <p className="font-bold text-jet">Pay by Card</p>
              <p className="text-jet/40 text-sm mt-0.5">Secure payment via Stripe. Instant activation.</p>
            </div>
          </button>
          <button
            onClick={onCash}
            disabled={loading === 'cash'}
            className="w-full flex items-center gap-5 p-5 rounded-2xl border border-jet/10 hover:border-gold/40 hover:bg-cream-2 transition-all duration-200 disabled:opacity-60 text-left group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2" style={{ background: `${GOLD}15`, borderColor: `${GOLD}40` }}>
              {loading === 'cash'
                ? <FiLoader size={20} className="animate-spin" style={{ color: GOLD }} />
                : <FiMapPin size={20} style={{ color: GOLD }} />}
            </div>
            <div>
              <p className="font-bold text-jet">Cash on Visit</p>
              <p className="text-jet/40 text-sm mt-0.5">Reserve now, pay cash when you visit the gym.</p>
            </div>
          </button>
        </div>
        <p className="text-center text-jet/20 text-xs mt-6 flex items-center justify-center gap-1">
          <FiLock size={10} /> Card payments are secured by Stripe.
        </p>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/plans')
      .then(res => setPlans(res.data.plans))
      .catch(err => toast.error('Could not load plans: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const handlePlanClick = (plan) => {
    if (!isAuthenticated) { navigate('/register'); return; }
    if (isCurrentPlan(plan)) { toast('You are already on this plan!', { icon: '✓' }); return; }
    setSelectedPlan(plan);
  };

  const handleCardPayment = async () => {
    setPaymentLoading('card');
    try {
      const res = await api.post('/payments/create-checkout-session', { planId: selectedPlan._id });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.message);
      setPaymentLoading(null);
    }
  };

  const handleCashPayment = async () => {
    setPaymentLoading('cash');
    try {
      const res = await api.post('/payments/cash-request', { planId: selectedPlan._id });
      updateUser({ subscription: res.data.subscription });
      setSelectedPlan(null);
      toast.success('Plan reserved! Visit the gym to pay and activate your membership. 💪', { duration: 6000 });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPaymentLoading(null);
    }
  };

  const isCurrentPlan = (plan) =>
    user?.subscription?.planId === plan._id &&
    (user?.subscription?.status === 'active' || user?.subscription?.status === 'pending');

  const getPlanStatus = (plan) => {
    if (user?.subscription?.planId === plan._id) {
      if (user?.subscription?.status === 'active')  return 'active';
      if (user?.subscription?.status === 'pending') return 'pending';
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Membership Plans</p>
          <h1 className="font-display text-6xl md:text-8xl mb-6 text-jet">CHOOSE<br />YOUR PLAN</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-96 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-2xl font-bold text-jet mb-2">No plans available</h2>
          <p className="text-jet/40 mb-6">Could not load membership plans.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => { setSelectedPlan(null); setPaymentLoading(null); }}
          onCard={handleCardPayment}
          onCash={handleCashPayment}
          loading={paymentLoading}
        />
      )}

      {/* ── Page wrapper: fully cream ── */}
      <div className="min-h-screen bg-cream pb-16">

        {/* Header — jet black band */}
        <div className="bg-jet text-cream pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Membership Plans</p>
            <h1 className="font-display text-6xl md:text-8xl mb-6 text-cream">CHOOSE<br />YOUR PLAN</h1>
            <p className="text-cream/50 text-lg max-w-xl mx-auto">
              No contracts. No hidden fees. Pay by card instantly or cash when you visit.
            </p>
            <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
              <span className="flex items-center gap-2 text-cream/30 text-xs">
                <FiCreditCard size={13} style={{ color: GOLD }} /> Card via Stripe — Instant activation
              </span>
              <span className="flex items-center gap-2 text-cream/30 text-xs">
                <FiMapPin size={13} style={{ color: GOLD }} /> Cash on Visit — Pay at the gym
              </span>
            </div>
          </div>
        </div>

        {/* Plans Grid — on cream */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {plans.map(plan => {
              const status = getPlanStatus(plan);
              return (
                <div
                  key={plan._id}
                  className={`relative bg-white rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                    plan.isPopular
                      ? 'border-2 shadow-xl shadow-jet/10'
                      : 'border border-jet/8 hover:border-jet/20 hover:shadow-md hover:shadow-jet/5'
                  }`}
                  style={plan.isPopular ? { borderColor: GOLD } : {}}
                >
                  {plan.isPopular && (
                    <div className="text-cream text-xs font-bold uppercase tracking-widest py-2 text-center flex items-center justify-center gap-1" style={{ background: GOLD }}>
                      <FiZap size={12} /> Most Popular
                    </div>
                  )}
                  <div className="p-8 flex flex-col h-full">
                    {/* Color bar — all gold */}
                    <div className="w-10 h-1 rounded-full mb-6" style={{ background: GOLD }} />
                    <h2 className="text-xl font-bold mb-1 text-jet">{plan.name}</h2>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-display text-5xl text-jet">${plan.price}</span>
                      <span className="text-jet/30 text-sm">/{plan.duration?.unit}</span>
                    </div>
                    {plan.duration?.unit === 'year' && (
                      <p className="text-xs mb-2 font-semibold" style={{ color: GOLD }}>Save ${(59 * 12 - plan.price)} vs monthly</p>
                    )}
                    <p className="text-jet/40 text-xs leading-relaxed mb-6 mt-2">{plan.description}</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {(plan.features || []).map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-jet/60">
                          <FiCheck size={14} className="mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {status === 'active' ? (
                      <div className="w-full py-3 rounded-xl text-center text-sm font-semibold border-2 bg-cream-2" style={{ borderColor: GOLD, color: GOLD }}>
                        ✓ Active Plan
                      </div>
                    ) : status === 'pending' ? (
                      <div className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-cream-2 border border-jet/10 text-jet/50">
                        ⏳ Pending Cash Payment
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePlanClick(plan)}
                        className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
                        style={plan.isPopular
                          ? { background: GOLD, color: '#fff' }
                          : { background: '#111111', color: '#F5F0E8' }
                        }
                      >
                        {isAuthenticated ? 'Get This Plan' : 'Get Started'}
                      </button>
                    )}
                    <div className="flex items-center justify-center gap-3 mt-3 text-jet/20 text-xs">
                      <span className="flex items-center gap-1"><FiCreditCard size={10} /> Card</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><FiMapPin size={10} /> Cash</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cash on Visit explainer */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-white border border-jet/8 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}15`, border: `1.5px solid ${GOLD}40` }}>
                <FiMapPin size={18} style={{ color: GOLD }} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4 text-jet">How Cash on Visit Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
                  {[
                    { step: '1', title: 'Reserve Online',  desc: 'Choose your plan and select "Cash on Visit" to reserve your spot.' },
                    { step: '2', title: 'Visit the Gym',   desc: 'Come to FitForge and pay the membership fee in cash at the front desk.' },
                    { step: '3', title: 'Get Activated',   desc: 'Our staff activates your membership instantly — you are ready to train!' },
                  ].map(s => (
                    <div key={s.step} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: `${GOLD}15`, color: GOLD, border: `1.5px solid ${GOLD}30` }}>
                        {s.step}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-jet">{s.title}</p>
                        <p className="text-jet/40 text-xs mt-1 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <h2 className="font-display text-4xl text-center mb-10 text-jet">COMMON QUESTIONS</h2>
          <div className="space-y-3">
            {[
              { q: 'Is my card payment secure?',          a: 'Yes. All card payments are processed by Stripe, a PCI-DSS Level 1 certified provider. We never see or store your card details.' },
              { q: 'How long does cash activation take?', a: 'Once you visit the gym and pay, our staff activates your membership immediately on the spot.' },
              { q: 'Can I switch from cash to card later?',a: 'Yes, simply choose a plan again and pay by card. Your membership will be updated instantly.' },
              { q: 'Is there a joining fee?',             a: 'No joining fee, ever. Just the plan price.' },
              { q: 'How do I cancel?',                    a: 'Cancel anytime from your dashboard. Your membership stays active until the end of the paid period.' },
            ].map(faq => (
              <details key={faq.q} className="bg-white border border-jet/8 rounded-2xl group">
                <summary className="p-6 cursor-pointer flex items-center justify-between font-semibold text-sm text-jet hover:text-gold transition-colors list-none">
                  {faq.q}
                  <span className="text-jet/30 group-open:text-gold transition-colors text-lg leading-none">+</span>
                </summary>
                <div className="px-6 pb-6 text-sm text-jet/50 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
