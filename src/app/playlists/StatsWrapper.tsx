'use client';

import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';

const PlaylistStatsClient = dynamic(() => import('./PlaylistStatsClient'), {
  ssr: false,
  loading: () => <div>Loading stats...</div>
});

export function StatsWrapper() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger a refresh
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Expose the refresh function globally
  if (typeof window !== 'undefined') {
    (window as any).refreshPlaylistStats = triggerRefresh;
  }

  return (
    <div className="h-full">
      <Suspense fallback={<div>Loading stats...</div>}>
        <PlaylistStatsClient refreshTrigger={refreshTrigger} />
      </Suspense>
    </div>
  );
} 