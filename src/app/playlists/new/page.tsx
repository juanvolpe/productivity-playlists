'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlaylistCreateInput } from '@/types/playlist';

interface TaskInput {
  id: string;
  title: string;
  duration: number;
  isCompleted: boolean;
  order: number;
}

export default function NewPlaylistPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [tasks, setTasks] = useState<TaskInput[]>([]);
  const [draggedTask, setDraggedTask] = useState<number | null>(null);
  const [activeDays, setActiveDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        id: `task-${Date.now()}`,
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTask(index);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedTask === null) return;

    const newTasks = [...tasks];
    const [draggedItem] = newTasks.splice(draggedTask, 1);
    newTasks.splice(dropIndex, 0, draggedItem);

    // Update order property for all tasks
    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      order: index + 1,
    }));

    setTasks(updatedTasks);
    setDraggedTask(null);
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
      const playlistData: PlaylistCreateInput = {
        name,
        monday: activeDays.monday,
        tuesday: activeDays.tuesday,
        wednesday: activeDays.wednesday,
        thursday: activeDays.thursday,
        friday: activeDays.friday,
        saturday: activeDays.saturday,
        sunday: activeDays.sunday,
        tasks: {
          create: tasks.map(task => ({
            title: task.title,
            duration: task.duration,
            isCompleted: false,
            order: task.order
          }))
        }
      };

      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playlistData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create playlist');
      }

      router.push('/playlists');
      router.refresh();
    } catch (error) {
      console.error('Failed to create playlist:', error);
      alert('Failed to create playlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="page-title mb-8">Create New Playlist</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Playlist Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900"
            placeholder="Enter playlist name"
          />
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
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="flex gap-2 items-center bg-white p-2 rounded-md shadow-sm border border-gray-200 cursor-move transition-opacity duration-200"
              >
                <div className="text-gray-400">☰</div>
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
          </div>
          <button
            type="button"
            onClick={handleAddTask}
            className="w-full mt-4 p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500"
          >
            Add Task
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Creating...' : 'Create Playlist'}
        </button>
      </form>
    </main>
  );
} 