'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const PlaylistStatsClient = dynamic(() => import('./PlaylistStatsClient'), {
  ssr: false,
  loading: () => <div>Loading stats...</div>
});

export function StatsWrapper() {
  return (
    <div className="mt-8">
      <Suspense fallback={<div>Loading stats...</div>}>
        <PlaylistStatsClient />
      </Suspense>
    </div>
  );
} 