'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlaylistWithTasks } from '@/types/playlist';

interface TaskInput {
  id: string;
  title: string;
  duration: number;
  isCompleted: boolean;
  order: number;
}

export default function EditPlaylistPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [tasks, setTasks] = useState<TaskInput[]>([]);
  const [activeDays, setActiveDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  useEffect(() => {
    loadPlaylist();
  }, []);

  const loadPlaylist = async () => {
    try {
      const response = await fetch(`/api/playlists/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch playlist');
      }
      const playlist: PlaylistWithTasks = await response.json();
      
      setName(playlist.name);
      setTasks(playlist.tasks.map(task => ({
        id: task.id,
        title: task.title,
        duration: task.duration,
        isCompleted: task.isCompleted,
        order: task.order,
      })));
      setActiveDays({
        monday: playlist.monday,
        tuesday: playlist.tuesday,
        wednesday: playlist.wednesday,
        thursday: playlist.thursday,
        friday: playlist.friday,
        saturday: playlist.saturday,
        sunday: playlist.sunday,
      });
    } catch (error) {
      console.error('Failed to load playlist:', error);
      alert('Failed to load playlist. Please try again later.');
      router.push('/playlists');
    }
  };

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        id: `temp-${Date.now()}`,
        title: '',
        duration: 5,
        isCompleted: false,
        order: tasks.length + 1,
      },
    ]);
  };

  const handleTaskChange = (index: number, field: keyof TaskInput, value: any) => {
    setTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (tasks.length === 0) {
      alert('Please add at least one task');
      return;
    }

    if (!Object.values(activeDays).some(day => day)) {
      alert('Please select at least one active day');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/playlists/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          ...activeDays,
          tasks: tasks.map(task => ({
            id: task.id.startsWith('temp-') ? undefined : task.id,
            title: task.title,
            duration: task.duration,
            isCompleted: task.isCompleted,
            order: task.order,
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update playlist');
      }

      router.push('/playlists');
      router.refresh();
    } catch (error) {
      console.error('Failed to update playlist:', error);
      alert('Failed to update playlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-3xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Playlist Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </label>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Active Days</h3>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(activeDays).map(([day, isActive]) => (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDays(prev => ({ ...prev, [day]: !isActive }))}
              className={`p-2 text-sm rounded ${
                isActive ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {day.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Tasks</h3>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={task.id} className="flex gap-2">
              <input
                type="text"
                value={task.title}
                onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                placeholder="Task name"
                className="flex-1 rounded-md border-gray-300"
                required
              />
              <input
                type="number"
                value={task.duration}
                onChange={(e) => handleTaskChange(index, 'duration', parseInt(e.target.value) || 0)}
                placeholder="Minutes"
                className="w-20 rounded-md border-gray-300"
                required
                min="1"
              />
              <button
                type="button"
                onClick={() => setTasks(prev => prev.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddTask}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 