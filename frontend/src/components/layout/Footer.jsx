import { Link } from 'react-router-dom';
import { MdFitnessCenter } from 'react-icons/md';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-jet text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-cream rounded-lg flex items-center justify-center">
                <MdFitnessCenter className="text-jet text-lg" />
              </div>
              <span className="font-display text-2xl tracking-tight text-cream">
                FIT<span style={{ color: '#C9A84C' }}>FORGE</span>
              </span>
            </Link>
            <p className="text-cream/40 text-sm leading-relaxed mb-6">
              Your premium gym destination. World-class equipment, expert trainers, and a community that pushes you further.
            </p>
            <div className="flex gap-3">
              {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-cream/5 border border-cream/10 rounded-lg flex items-center justify-center text-cream/40 hover:text-cream hover:border-cream/30 transition-all duration-200">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream/30 mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: '/',         label: 'Home' },
                { to: '/plans',    label: 'Membership Plans' },
                { to: '/gallery',  label: 'Gallery' },
                { to: '/book',     label: 'Book a Session' },
                { to: '/dashboard',label: 'My Dashboard' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-cream/40 hover:text-cream transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Classes */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream/30 mb-5">Classes</h4>
            <ul className="space-y-3">
              {['HIIT Training', 'Power Yoga', 'CrossFit', 'Spin Cycle', 'Boxing', 'Pilates'].map(cls => (
                <li key={cls}>
                  <Link to="/book" className="text-sm text-cream/40 hover:text-cream transition-colors duration-200">
                    {cls}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream/30 mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-cream/40">
                <FiMapPin size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#C9A84C' }} />
                <span>123 Fitness Boulevard<br />Cairo, Egypt 11511</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-cream/40">
                <FiPhone size={14} className="flex-shrink-0" style={{ color: '#C9A84C' }} />
                <a href="tel:+20123456789" className="hover:text-cream transition-colors">+20 123 456 789</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-cream/40">
                <FiMail size={14} className="flex-shrink-0" style={{ color: '#C9A84C' }} />
                <a href="mailto:hello@fitforge.com" className="hover:text-cream transition-colors">hello@fitforge.com</a>
              </li>
            </ul>
            <div className="mt-6 p-3 bg-cream/5 border border-cream/10 rounded-xl">
              <p className="text-xs text-cream/40">
                <span className="font-semibold" style={{ color: '#C9A84C' }}>Open Daily:</span><br />
                Mon–Fri: 5:00 AM – 11:00 PM<br />
                Sat–Sun: 6:00 AM – 10:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/8 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/20">© {new Date().getFullYear()} FitForge. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-cream/20">
            <a href="#" className="hover:text-cream/50 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cream/50 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cream/50 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
