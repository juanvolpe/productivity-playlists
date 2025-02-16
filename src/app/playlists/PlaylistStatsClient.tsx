'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

type PlaylistStat = {
  playlistId: string;
  title: string;
  completionCount: number;
};

export default function PlaylistStatsClient({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [stats, setStats] = useState<PlaylistStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const startDate = startOfMonth(selectedMonth);
        const endDate = endOfMonth(selectedMonth);
        const response = await fetch(
          `/api/playlist-stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch stats');
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedMonth, refreshTrigger]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <h2 className="text-lg font-semibold text-gray-900">Monthly Stats</h2>
        <select 
          value={format(selectedMonth, 'yyyy-MM')}
          onChange={(e) => setSelectedMonth(new Date(e.target.value))}
          className="rounded-md border-gray-300 text-sm py-1 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return (
              <option key={i} value={format(date, 'yyyy-MM')}>
                {format(date, 'MMMM yyyy')}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <table className="w-full table-auto bg-white">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr>
                <th className="px-4 py-3 text-left bg-gray-50 font-medium text-gray-900">Playlist Name</th>
                <th className="px-4 py-3 text-right bg-gray-50 font-medium text-gray-900">Completions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading stats...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center">
                    <div className="text-red-500">{error}</div>
                  </td>
                </tr>
              ) : stats.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    No playlists completed this month
                  </td>
                </tr>
              ) : (
                stats.map((stat) => (
                  <tr key={stat.playlistId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{stat.title}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {stat.completionCount} times
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 