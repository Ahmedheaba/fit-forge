import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck, FiStar, FiZap, FiTrash2 } from "react-icons/fi";
import { MdFitnessCenter } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const GOLD = "#C9A84C";

function HeroSection() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-cream">
      <div className="absolute inset-0 hero-grid opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — content */}
          <div>
            <div className="inline-flex items-center gap-2 border border-jet/15 rounded-full px-4 py-2 mb-8 bg-white shadow-sm">
              <FiZap size={12} style={{ color: GOLD }} />
              <span className="text-jet text-xs font-semibold uppercase tracking-widest">
                Premium Fitness Experience
              </span>
            </div>
            <h1 className="font-display text-7xl sm:text-8xl md:text-9xl leading-none tracking-tight mb-6 text-jet">
              FORGE
              <br />
              <span style={{ color: GOLD }}>YOUR</span>
              <br />
              BEST SELF
            </h1>
            <p className="text-jet/50 text-lg leading-relaxed max-w-md mb-10">
              World-class equipment, expert trainers, and a community that
              pushes you further every single day.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={isAuthenticated ? "/book" : "/register"}
                className="btn-primary flex items-center gap-2 text-base"
              >
                {isAuthenticated ? "Book a Session" : "Start Free Trial"}
                <FiArrowRight size={18} />
              </Link>
              <Link
                to="/plans"
                className="btn-secondary flex items-center gap-2 text-base"
              >
                View Plans
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-jet/8">
              {[
                { value: "5,000+", label: "Active Members" },
                { value: "50+", label: "Expert Trainers" },
                { value: "98%", label: "Satisfaction" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-4xl" style={{ color: GOLD }}>
                    {stat.value}
                  </p>
                  <p className="text-jet/40 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stats panel */}
          <div className="hidden lg:flex flex-col gap-5">
            <div className="bg-jet rounded-2xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-cream/10 flex items-center justify-center mb-5">
                <MdFitnessCenter size={24} className="text-cream" />
              </div>
              <h3 className="font-display text-3xl text-cream mb-2">
                100+ CLASSES
              </h3>
              <p className="text-cream/40 text-sm">
                Weekly schedule across 8 disciplines
              </p>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-jet rounded-2xl p-6">
                <p
                  className="font-display text-4xl mb-1"
                  style={{ color: GOLD }}
                >
                  24/7
                </p>
                <p className="text-cream/40 text-xs">Gym Access</p>
              </div>
              <div className="bg-jet rounded-2xl p-6">
                <p className="font-display text-4xl mb-1 text-cream">500+</p>
                <p className="text-cream/40 text-xs">Machines</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "🏋️",
      title: "Premium Equipment",
      desc: "500+ machines and free weights. Always maintained, always ready.",
    },
    {
      icon: "👨‍🏫",
      title: "Expert Trainers",
      desc: "Certified professionals in strength, cardio, and specialized training.",
    },
    {
      icon: "📱",
      title: "Smart Booking",
      desc: "Book classes, track progress, and manage your membership effortlessly.",
    },
    {
      icon: "🧘",
      title: "50+ Weekly Classes",
      desc: "HIIT to yoga, cycling to boxing — a class for every goal.",
    },
    {
      icon: "🥗",
      title: "Nutrition Guidance",
      desc: "Personalized nutrition plans from certified nutritionists.",
    },
    {
      icon: "🔐",
      title: "24/7 Access",
      desc: "Premium members enjoy round-the-clock gym access.",
    },
  ];
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: GOLD }}
        >
          Why FitForge
        </p>
        <h2 className="section-title">
          EVERYTHING
          <br />
          YOU NEED
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="card-hover p-8 group bg-white">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-bold mb-2 text-jet group-hover:text-gold transition-colors">
              {f.title}
            </h3>
            <p className="text-jet/40 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClassesSection() {
  const classes = [
    {
      name: "Morning HIIT Blast",
      trainer: "Marcus Williams",
      time: "6:00 AM",
      spots: 5,
      category: "HIIT",
      color: "#E74C3C",
    },
    {
      name: "Power Yoga Flow",
      trainer: "Sophia Chen",
      time: "7:30 AM",
      spots: 8,
      category: "Yoga",
      color: "#9B59B6",
    },
    {
      name: "CrossFit WOD",
      trainer: "Jake Rodriguez",
      time: "7:00 AM",
      spots: 3,
      category: "CrossFit",
      color: "#C9A84C",
    },
    {
      name: "Spin Cycle",
      trainer: "Aisha Johnson",
      time: "6:30 AM",
      spots: 12,
      category: "Cycling",
      color: "#111111",
    },
    {
      name: "Boxing Fundamentals",
      trainer: "Derek Thompson",
      time: "6:00 PM",
      spots: 6,
      category: "Boxing",
      color: "#E74C3C",
    },
    {
      name: "Strength & Conditioning",
      trainer: "Marcus Williams",
      time: "9:00 AM",
      spots: 4,
      category: "Strength",
      color: "#2E86AB",
    },
  ];
  return (
    <section className="py-24" style={{ background: "#EDE8DF" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: GOLD }}
            >
              This Week
            </p>
            <h2 className="section-title">
              FEATURED
              <br />
              CLASSES
            </h2>
          </div>
          <Link to="/book" className="btn-secondary self-start sm:self-auto">
            View All Classes →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <div
              key={cls.name}
              className="group relative bg-white border border-jet/8 rounded-2xl p-6 hover:border-jet/20 hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                style={{ background: cls.color }}
              />
              <div className="flex items-start justify-between mb-4">
                <span
                  className="badge text-xs"
                  style={{ background: `${cls.color}15`, color: cls.color }}
                >
                  {cls.category}
                </span>
                <span className="text-xs text-jet/30">
                  {cls.spots} spots left
                </span>
              </div>
              <h3 className="font-bold text-sm mb-1 text-jet group-hover:text-gold transition-colors">
                {cls.name}
              </h3>
              <p className="text-jet/40 text-xs mb-4">with {cls.trainer}</p>
              <div className="flex items-center justify-between">
                <span className="text-jet/50 text-sm font-mono">
                  {cls.time}
                </span>
                <Link
                  to="/book"
                  className="text-xs font-semibold hover:underline"
                  style={{ color: GOLD }}
                >
                  Book →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrainersSection() {
  const trainers = [
    {
      name: "Marcus Williams",
      specialty: "Strength & HIIT",
      exp: "8 years",
      cert: "NASM-CPT",
      emoji: "💪",
    },
    {
      name: "Sophia Chen",
      specialty: "Yoga & Pilates",
      exp: "10 years",
      cert: "RYT-500",
      emoji: "🧘",
    },
    {
      name: "Jake Rodriguez",
      specialty: "CrossFit & Olympic Lifting",
      exp: "6 years",
      cert: "CF-L3",
      emoji: "🏋️",
    },
    {
      name: "Aisha Johnson",
      specialty: "Cycling & Cardio",
      exp: "7 years",
      cert: "SPINNING®",
      emoji: "🚴",
    },
  ];
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: GOLD }}
        >
          The Team
        </p>
        <h2 className="section-title">
          MEET YOUR
          <br />
          TRAINERS
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trainers.map((t) => (
          <div
            key={t.name}
            className="card-hover group text-center p-8 bg-white"
          >
            <div className="w-20 h-20 rounded-2xl bg-cream-2 border border-jet/8 flex items-center justify-center text-4xl mx-auto mb-5 group-hover:border-gold transition-all duration-300">
              {t.emoji}
            </div>
            <h3 className="font-bold text-lg mb-1 text-jet">{t.name}</h3>
            <p className="text-sm font-medium mb-3" style={{ color: GOLD }}>
              {t.specialty}
            </p>
            <div className="flex justify-center gap-4 text-xs text-jet/30">
              <span>{t.exp}</span>
              <span>·</span>
              <span>{t.cert}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const loadReviews = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.data.reviews);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', { rating, comment });
      toast.success("Review submitted successfully!");
      setShowForm(false);
      setComment("");
      setRating(5);
      loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit review");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      loadReviews();
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  return (
    <section className="py-24" style={{ background: "#EDE8DF" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: GOLD }}
          >
            Success Stories
          </p>
          <h2 className="section-title">
            REAL PEOPLE,
            <br />
            REAL RESULTS
          </h2>
        </div>
        
        {loading ? (
          <div className="text-center text-jet/50">Loading reviews...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {reviews.map((t) => {
              const name = t.user ? t.user.name : t.guestName;
              const role = t.user ? (t.user.activePlan ? `${t.user.activePlan.charAt(0).toUpperCase() + t.user.activePlan.slice(1)} Member` : "Member") : t.guestRole;
              
              return (
                <div
                  key={t._id}
                  className="group relative bg-white border border-jet/8 rounded-2xl p-8 flex flex-col"
                >
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(t._id)}
                      className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete review"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        size={14}
                        style={{ color: i < t.rating ? GOLD : "#E5E5E5", fill: i < t.rating ? GOLD : "transparent" }}
                      />
                    ))}
                  </div>
                  <p className="text-jet/60 text-sm leading-relaxed flex-1 mb-6">
                    "{t.comment}"
                  </p>
                  <div>
                    <p className="font-bold text-sm text-jet">{name}</p>
                    <p className="text-jet/30 text-xs mt-0.5">{role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic User Review Form */}
        {isAuthenticated ? (
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-jet/8">
            {!showForm ? (
               <div className="text-center">
                 <p className="text-jet/60 mb-4 font-medium text-sm">Have a story to share?</p>
                 <button onClick={() => setShowForm(true)} className="btn-secondary w-full">Write a Review</button>
               </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="font-bold text-jet">Write a Review</h3>
                   <button type="button" onClick={() => setShowForm(false)} className="text-xs text-jet/40 hover:text-jet uppercase font-bold tracking-wider">Cancel</button>
                </div>
                <div>
                  <label className="label">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setRating(star)} 
                        className="p-1 transition-transform hover:scale-110"
                      >
                         <FiStar size={24} style={{ color: GOLD, fill: star <= rating ? GOLD : "transparent" }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Your Comment</label>
                  <textarea 
                    className="input resize-none" 
                    rows={4} 
                    required 
                    placeholder="Share your experience here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary w-full">Submit Feedback</button>
              </form>
            )}
          </div>
        ) : (
          <div className="text-center text-jet/50 text-sm">
             <Link to="/login" className="underline hover:text-jet font-medium">Log in</Link> or <Link to="/register" className="underline hover:text-jet font-medium">Sign up</Link> to leave your own feedback.
          </div>
        )}

      </div>
    </section>
  );
}

function CTASection() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-jet rounded-3xl p-12 md:p-16 overflow-hidden text-center">
          <div className="absolute inset-0 hero-grid opacity-10" />
          <div className="relative z-10">
            <h2 className="font-display text-6xl md:text-7xl text-cream mb-6 leading-none">
              READY TO
              <br />
              <span style={{ color: GOLD }}>TRANSFORM?</span>
            </h2>
            <p className="text-cream/50 text-lg max-w-xl mx-auto mb-10">
              Join 5,000+ members who have already started their fitness
              journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={isAuthenticated ? "/book" : "/register"}
                className="bg-cream text-jet font-bold py-3 px-8 rounded-lg hover:bg-cream-2 transition-colors flex items-center gap-2"
              >
                {isAuthenticated ? "Book Now" : "Start Free Trial"}{" "}
                <FiArrowRight size={18} />
              </Link>
              <Link
                to="/plans"
                className="border border-cream/20 text-cream font-semibold py-3 px-8 rounded-lg hover:border-cream/50 transition-colors"
              >
                See Plans
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-cream/30">
              {[
                "No commitment required",
                "Cancel anytime",
                "First week free",
              ].map((p) => (
                <span key={p} className="flex items-center gap-2">
                  <FiCheck size={14} style={{ color: GOLD }} /> {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="py-24" style={{ background: "#EDE8DF" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: GOLD }}
            >
              Get in Touch
            </p>
            <h2 className="section-title mb-6">
              HAVE
              <br />
              QUESTIONS?
            </h2>
            <p className="text-jet/50 leading-relaxed mb-8">
              Our team is here to help you find the perfect plan, schedule a
              tour, or answer any questions about our facilities.
            </p>
            <div className="space-y-4 text-sm text-jet/50">
              <p>📍 123 Fitness Boulevard, Cairo, Egypt</p>
              <p>📞 +20 123 456 789</p>
              <p>✉️ hello@fitforge.com</p>
              <p>🕐 Mon–Fri 5AM–11PM · Sat–Sun 6AM–10PM</p>
            </div>
          </div>
          <form
            className="bg-white border border-jet/8 rounded-2xl p-8 space-y-5 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Message sent! We will be in touch shortly.");
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input className="input" placeholder="John" required />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" placeholder="Doe" required />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Subject</label>
              <select className="input bg-cream-2">
                <option>General Inquiry</option>
                <option>Membership Plans</option>
                <option>Personal Training</option>
                <option>Schedule a Tour</option>
              </select>
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="How can we help you?"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ClassesSection />
      <TrainersSection />
      <TestimonialsSection />
      <CTASection />
      <ContactSection />
    </>
  );
}
