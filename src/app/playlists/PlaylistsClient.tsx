'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlaylistWithTasks } from '@/types/playlist';

function getScheduleDays(playlist: PlaylistWithTasks): string[] {
  const days = [];
  if (playlist.monday) days.push('Monday');
  if (playlist.tuesday) days.push('Tuesday');
  if (playlist.wednesday) days.push('Wednesday');
  if (playlist.thursday) days.push('Thursday');
  if (playlist.friday) days.push('Friday');
  if (playlist.saturday) days.push('Saturday');
  if (playlist.sunday) days.push('Sunday');
  return days;
}

interface PlaylistsClientProps {
  initialPlaylists: PlaylistWithTasks[];
}

export default function PlaylistsClient({ initialPlaylists }: PlaylistsClientProps) {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<PlaylistWithTasks[]>(initialPlaylists);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const handleDelete = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete playlist');
      }

      // Remove the playlist from local state
      setPlaylists(playlists.filter(p => p.id !== playlistId));
      
      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      alert('Failed to delete playlist. Please try again.');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to clean up all playlists? This will mark all tasks as incomplete.')) return;

    try {
      setIsCleaningUp(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateString = today.toISOString().split('T')[0];

      // Process playlists sequentially to avoid overwhelming the server
      for (const playlist of playlists) {
        const response = await fetch(`/api/playlists/${playlist.id}/tasks/cleanup?date=${dateString}`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to cleanup tasks');
        }
      }

      // Give the server a moment to update its state
      await new Promise(resolve => setTimeout(resolve, 100));

      // Refresh the page to show updated state
      router.refresh();
      
      // Refresh the stats after a short delay to ensure the server has updated
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).refreshPlaylistStats) {
          (window as any).refreshPlaylistStats();
        }
      }, 200);
    } catch (error) {
      console.error('Failed to cleanup tasks:', error);
      alert('Failed to cleanup tasks. Please try again.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL playlists? This action cannot be undone.')) return;

    try {
      // Process playlists sequentially to avoid overwhelming the server
      for (const playlist of playlists) {
        const response = await fetch(`/api/playlists/${playlist.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete playlist');
        }
      }

      // Clear all playlists from local state
      setPlaylists([]);
      
      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('Failed to delete playlists:', error);
      alert('Failed to delete playlists. Please try again.');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b border-gray-100">
        <h1 className="text-xl font-poppins font-bold text-text-primary">Your Playlists</h1>
        <div className="flex items-center gap-2 mt-4">
          <Link
            href="/playlists/new"
            className="inline-flex items-center px-4 py-2 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors shadow-sm"
          >
            <svg 
              className="w-3.5 h-3.5 mr-1.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            Create New
          </Link>
          <button
            onClick={handleCleanup}
            disabled={isCleaningUp}
            className="inline-flex items-center px-4 py-2 text-xs font-medium text-text-secondary bg-white border border-gray-200 rounded-md hover:border-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50 shadow-sm"
          >
            <svg 
              className="w-3.5 h-3.5 mr-1.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
            {isCleaningUp ? 'Cleaning...' : 'Cleanup Old'}
          </button>
          <button
            onClick={handleDeleteAll}
            className="inline-flex items-center px-4 py-2 text-xs font-medium text-red-500 bg-white border border-gray-200 rounded-md hover:text-red-600 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-100 transition-colors shadow-sm"
          >
            <svg 
              className="w-3.5 h-3.5 mr-1.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
            Delete All
          </button>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto">
        <div className="space-y-3 px-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-accent hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-poppins font-medium text-text-primary">{playlist.name}</h2>
                <span className="text-xs text-text-secondary">({playlist.tasks.length} tasks)</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/playlists/${playlist.id}`}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors shadow-sm"
                >
                  View & Edit
                </Link>
                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 