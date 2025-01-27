'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto flex justify-around p-4">
        <Link
          href="/"
          className={`flex flex-col items-center ${
            pathname === '/' ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          <span className="text-sm">Today</span>
        </Link>
        <Link
          href="/playlists"
          className={`flex flex-col items-center ${
            pathname.startsWith('/playlists') ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          <span className="text-sm">Playlists</span>
        </Link>
      </div>
    </nav>
  );
} 