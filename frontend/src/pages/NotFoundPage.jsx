import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-[12rem] leading-none text-white/5 select-none">404</p>
        <h1 className="font-display text-5xl -mt-12 mb-4">PAGE NOT FOUND</h1>
        <p className="text-white/40 mb-8">The page you are looking for does not exist.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
