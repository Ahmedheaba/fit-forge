import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { FiCheck, FiCalendar, FiArrowRight } from "react-icons/fi";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [details, setDetails] = useState(null);
  const { updateUser } = useAuth();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    // Verify the payment with the backend
    api
      .get(`/payments/verify-session/${sessionId}`)
      .then((res) => {
        setDetails(res.data);
        updateUser({ subscription: res.data.subscription });
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [sessionId]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-neon border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white/50">Confirming your payment…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Payment Verification Failed
          </h1>
          <p className="text-white/40 mb-8">
            We could not verify your payment. If you were charged, please
            contact support.
          </p>
          <Link to="/plans" className="btn-primary">
            Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="w-24 h-24 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center neon-glow">
            <FiCheck size={40} className="text-neon" />
          </div>
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full border border-neon/20 animate-ping" />
        </div>

        <p className="text-neon text-xs font-semibold uppercase tracking-widest mb-3">
          Payment Successful
        </p>
        <h1 className="font-display text-5xl md:text-6xl mb-4">YOU'RE IN!</h1>
        <p className="text-white/50 text-lg mb-8">
          Welcome to{" "}
          <span className="text-white font-semibold">{details?.planName}</span>.
          Your membership is now active and ready to use.
        </p>

        {/* Plan details card */}
        <div className="card p-6 mb-8 text-left">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
            Membership Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">Plan</span>
              <span className="font-bold text-neon">{details?.planName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">Amount Paid</span>
              <span className="font-bold">${details?.amount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">Status</span>
              <span className="text-neon font-semibold text-sm">Active ✓</span>
            </div>
            {details?.subscription?.endDate && (
              <div className="flex justify-between items-center py-2">
                <span className="text-white/50 text-sm">Valid Until</span>
                <span className="font-bold text-sm">
                  {new Date(details.subscription.endDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Next steps */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/book"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FiCalendar size={16} />
            Book Your First Class
          </Link>
          <Link
            to="/dashboard"
            className="btn-secondary flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <FiArrowRight size={16} />
          </Link>
        </div>

        <p className="text-white/20 text-xs mt-8">
          A confirmation email has been sent to your inbox. Questions? Contact
          hello@fitforge.com
        </p>
      </div>
    </div>
  );
}
