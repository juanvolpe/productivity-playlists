'use client';

import { useState, useEffect } from 'react';
import { PlaylistWithTasks } from '@/types/playlist';
import PlaylistTimer from '../../[id]/PlaylistTimer';

interface PlaylistDateClientProps {
  playlist: PlaylistWithTasks;
  date: string;
}

export default function PlaylistDateClient({ playlist, date }: PlaylistDateClientProps) {
  const [completedTaskCount, setCompletedTaskCount] = useState(() => 
    playlist.tasks.filter(task => task.isCompleted).length
  );

  const handleTaskComplete = (isCompleted: boolean) => {
    setCompletedTaskCount(prev => isCompleted ? prev + 1 : prev - 1);
  };

  // Reset completed count when playlist changes
  useEffect(() => {
    setCompletedTaskCount(playlist.tasks.filter(task => task.isCompleted).length);
  }, [playlist]);

  const progressPercentage = Math.round((completedTaskCount / playlist.tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-accent/20 shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-poppins font-semibold text-text-primary">{playlist.name}</h1>
            <div className="text-sm text-text-secondary">
              {playlist.tasks.length} tasks
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-secondary">Progress</span>
              <span className="text-sm font-medium text-text-primary">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${progressPercentage}%`,
                  transitionProperty: 'width',
                  transitionDuration: '300ms'
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <main className="max-w-4xl mx-auto p-4">
        <PlaylistTimer 
          playlist={playlist} 
          date={date}
          onTaskComplete={handleTaskComplete}
        />
      </main>
    </div>
  );
} 