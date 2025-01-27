'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Playlist error:', error);
  }, [error]);

  return (
    <div className="p-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 text-lg font-medium mb-2">Error Loading Playlist</h2>
        <p className="text-red-600 mb-4">
          We couldn't load this playlist. This might be because:
        </p>
        <ul className="list-disc list-inside text-red-600 mb-6 space-y-1">
          <li>The playlist doesn't exist</li>
          <li>You don't have permission to view it</li>
          <li>There was a temporary server error</li>
        </ul>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/playlists"
            className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Playlists
          </Link>
        </div>
      </div>
    </div>
  );
} 