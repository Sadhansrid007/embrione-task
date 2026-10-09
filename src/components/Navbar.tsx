import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          The Embrione
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/register" className="hover:text-blue-400 transition-colors">Register</Link>
          <Link href="/team" className="hover:text-blue-400 transition-colors">Meet The Team</Link>
          <Link href="/admin" className="hover:text-blue-400 transition-colors">Admin Panel</Link>
        </div>
      </div>
    </nav>
  );
}