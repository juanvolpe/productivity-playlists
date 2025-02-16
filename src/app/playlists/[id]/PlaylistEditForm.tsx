'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AITaskGenerator } from '@/components/AITaskGenerator';
import { Task } from '@prisma/client';

interface PlaylistWithTasks {
  id: string;
  name: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  tasks: Task[];
}

interface Props {
  playlist: PlaylistWithTasks;
}

export function PlaylistEditForm({ playlist }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(playlist.name);
  const [tasks, setTasks] = useState<Task[]>(playlist.tasks);
  const [draggedTask, setDraggedTask] = useState<number | null>(null);
  const [activeDays, setActiveDays] = useState({
    monday: playlist.monday,
    tuesday: playlist.tuesday,
    wednesday: playlist.wednesday,
    thursday: playlist.thursday,
    friday: playlist.friday,
    saturday: playlist.saturday,
    sunday: playlist.sunday,
  });

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        id: `new-task-${Date.now()}`,
        title: '',
        duration: 5,
        isCompleted: false,
        order: tasks.length + 1,
        playlistId: playlist.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  };

  const handleTaskChange = (index: number, field: 'title' | 'duration', value: any) => {
    setTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    ));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTask(index);
  };

  const handleDragEnd = (e: React.DragEvent) => {
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
    const reorderedTasks = newTasks.map((task, index) => ({
      ...task,
      order: index + 1,
    }));

    setTasks(reorderedTasks);
    setDraggedTask(null);
  };

  const handleTasksGenerated = (generatedTasks: { title: string; duration: number }[]) => {
    const newTasks = generatedTasks.map((task, index) => ({
      id: `new-task-${Date.now()}-${index}`,
      title: task.title,
      duration: task.duration,
      isCompleted: false,
      order: tasks.length + index + 1,
      playlistId: playlist.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    setTasks([...tasks, ...newTasks]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    if (tasks.some(task => !task.title.trim())) {
      alert('Please fill in all task titles');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/playlists/${playlist.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          ...activeDays,
          tasks: tasks.map(task => ({
            id: task.id.startsWith('new-task-') ? undefined : task.id,
            title: task.title,
            duration: task.duration,
            order: task.order,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update playlist');
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
    <form onSubmit={handleSubmit} className="space-y-8 px-4 sm:px-6 md:px-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-poppins font-medium text-text-primary mb-2">
            Playlist Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent bg-white text-text-primary"
            placeholder="Enter playlist name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-poppins font-medium text-text-primary mb-2">
            Active Days
          </label>
          <div className="flex justify-between gap-2">
            {Object.entries(activeDays).map(([day, isActive]) => (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDays(prev => ({ ...prev, [day]: !isActive }))}
                className={`w-12 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-text-secondary hover:bg-accent hover:text-white'
                }`}
              >
                {day.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-poppins font-medium text-text-primary">Tasks</h2>
          <button
            type="button"
            onClick={handleAddTask}
            className="px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-primary transition-colors shadow-sm font-medium flex items-center gap-2"
          >
            <span>Add Task</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <AITaskGenerator
          playlistName={name}
          onTasksGenerated={handleTasksGenerated}
        />

        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-accent transition-colors"
            >
              <span className="text-text-secondary font-medium w-8 shrink-0">#{task.order}</span>
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white text-text-primary px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent placeholder-gray-400"
                  placeholder="Task title"
                  enterKeyHint="next"
                  inputMode="text"
                  autoComplete="off"
                />
              </div>
              <input
                type="number"
                value={task.duration}
                onChange={(e) => handleTaskChange(index, 'duration', parseInt(e.target.value) || 0)}
                className="w-16 sm:w-20 rounded-md border border-gray-200 bg-white text-text-primary px-2 sm:px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent placeholder-gray-400 shrink-0"
                min="1"
                placeholder="Min"
                enterKeyHint="done"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button
                type="button"
                onClick={() => setTasks(tasks.filter((_, i) => i !== index))}
                className="text-gray-400 hover:text-primary transition-colors p-1 shrink-0 ml-auto sm:ml-0"
              >
                <svg 
                  className="w-5 h-5" 
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
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-light disabled:opacity-50 font-medium shadow-sm"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 