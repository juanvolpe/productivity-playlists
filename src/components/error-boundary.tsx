'use client';

import { useEffect } from 'react';
import { logger } from '../lib/logger';

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    logger.error('Error boundary caught error:', error);
  }, [error]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
      <p className="text-gray-600">{error.message}</p>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {error.stack}
      </pre>
      <button
        onClick={() => {
          logger.info('Attempting error recovery');
          reset();
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Try again
      </button>
    </div>
  );
} 