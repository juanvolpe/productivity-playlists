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

      // Refresh the page to show updated state
      router.refresh();
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateString = today.toISOString().split('T')[0];

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="page-title mb-4">Manage Playlists</h1>
      <div className="flex gap-4 mb-8 w-full">
        <a
          href="/playlists/new"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-center"
        >
          Create Playlist
        </a>
        <button
          onClick={handleCleanup}
          disabled={isCleaningUp}
          className={`w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 ${
            isCleaningUp ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isCleaningUp ? 'Cleaning...' : 'Clean Up All'}
        </button>
        <button
          onClick={handleDeleteAll}
          className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-center"
        >
          Delete All
        </button>
      </div>

      <div className="space-y-4">
        {playlists.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
            <p className="text-gray-600 mb-4">No playlists yet</p>
            <a
              href="/playlists/new"
              className="text-indigo-500 hover:text-indigo-600 font-medium inline-flex items-center gap-2"
            >
              <span>Create your first playlist</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        ) : (
          playlists.map((playlist) => {
            // Calculate completion status
            const completedTasks = playlist.tasks.filter(task => 
              Array.isArray(task.completions) && task.completions.length > 0
            ).length;
            const totalTasks = playlist.tasks.length;
            let status = "Not Started";
            if (completedTasks === totalTasks && totalTasks > 0) {
              status = "Completed";
            } else if (completedTasks > 0) {
              status = "In Progress";
            }

            return (
              <div
                key={playlist.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/playlist/${playlist.id}/${dateString}`}
                      className="text-lg font-medium text-gray-900 hover:text-blue-500 block truncate"
                    >
                      {playlist.name}
                    </a>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {playlist.tasks.length} tasks
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/playlists/edit/${playlist.id}`}
                      className="text-gray-500 hover:text-blue-500"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(playlist.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
} 