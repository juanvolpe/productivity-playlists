'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

type PlaylistStat = {
  playlistId: string;
  title: string;
  completionCount: number;
};

export default function PlaylistStatsClient() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [stats, setStats] = useState<PlaylistStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const startDate = startOfMonth(selectedMonth);
        const endDate = endOfMonth(selectedMonth);
        const response = await fetch(
          `/api/playlist-stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedMonth]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Monthly Stats</h2>
      <div className="mb-6">
        <select 
          value={format(selectedMonth, 'yyyy-MM')}
          onChange={(e) => setSelectedMonth(new Date(e.target.value))}
          className="rounded border p-2"
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

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 text-left">Playlist Name</th>
              <th className="p-4 text-left">Completions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : stats.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-4 text-center text-gray-500">
                  No data for this month
                </td>
              </tr>
            ) : (
              stats.map((stat) => (
                <tr key={stat.playlistId} className="border-b">
                  <td className="p-4">{stat.title}</td>
                  <td className="p-4">{stat.completionCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 