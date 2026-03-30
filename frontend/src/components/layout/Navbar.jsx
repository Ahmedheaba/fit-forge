import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { MdFitnessCenter } from "react-icons/md";

const GOLD = "#C9A84C";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    // Set initial state
    setScrolled(window.scrollY > 10);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Always solid cream — no transparent navbar anywhere
  // This avoids the split-background problem on the homepage hero
  const navClass = scrolled
    ? "bg-cream/98 backdrop-blur-md shadow-md border-b border-jet/10"
    : "bg-cream border-b border-jet/8";

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/plans", label: "Plans" },
    { to: "/gallery", label: "Gallery" },
    ...(isAuthenticated ? [{ to: "/book", label: "Book" }] : []),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 bg-jet rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <MdFitnessCenter className="text-cream text-lg" />
            </div>
            <span className="font-display text-2xl tracking-tight text-jet">
              FIT<span style={{ color: GOLD }}>FORGE</span>
            </span>
          </Link>

          {/* ── Desktop Nav ──────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative text-sm font-medium transition-colors duration-200 hover:text-jet"
                  style={{
                    color: isActive ? "#111111" : "rgba(17,17,17,0.50)",
                  }}
                >
                  {link.label}
                  <span
                    className="absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-200"
                    style={{
                      width: isActive ? "100%" : "0%",
                      background: GOLD,
                    }}
                  />
                </Link>
              );
            })}
          </div>

          {/* ── Desktop Auth ─────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-jet/60 hover:text-jet transition-colors duration-200"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-jet/15"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-jet flex items-center justify-center">
                      <span className="text-cream text-sm font-bold">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-jet">
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-jet/10 rounded-xl shadow-xl shadow-jet/10 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-jet/8 bg-cream-2">
                        <p className="text-sm font-semibold text-jet">
                          {user?.name}
                        </p>
                        <p className="text-xs text-jet/40 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-jet/60 hover:text-jet hover:bg-cream-2 transition-colors"
                        >
                          <FiUser size={15} /> Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-jet/60 hover:text-jet hover:bg-cream-2 transition-colors"
                        >
                          <FiSettings size={15} /> Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold"
                            style={{ color: GOLD }}
                          >
                            <MdFitnessCenter size={15} /> Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-jet/8 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <FiLogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-jet/50 hover:text-jet px-4 py-2 rounded-lg hover:bg-jet/5 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold bg-jet text-cream px-5 py-2 rounded-lg hover:bg-jet-2 transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Toggle ─────────────────────────────────────────── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-jet/60 hover:text-jet"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-cream border-t border-jet/8 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-3 py-3 rounded-lg text-sm transition-colors"
                style={{
                  color:
                    location.pathname === link.to
                      ? "#111111"
                      : "rgba(17,17,17,0.50)",
                  background:
                    location.pathname === link.to
                      ? "rgba(17,17,17,0.05)"
                      : "transparent",
                  fontWeight: location.pathname === link.to ? 600 : 400,
                }}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-3 rounded-lg text-sm text-jet/50 hover:text-jet"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-3 rounded-lg text-sm text-jet/50 hover:text-jet"
                >
                  Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-3 rounded-lg text-sm font-semibold"
                    style={{ color: GOLD }}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-3 rounded-lg text-sm text-red-500 mt-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-3">
                <Link
                  to="/login"
                  className="flex-1 text-center py-2.5 rounded-lg border border-jet/15 text-jet text-sm font-medium hover:bg-jet/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center py-2.5 rounded-lg bg-jet text-cream text-sm font-bold hover:bg-jet-2 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
