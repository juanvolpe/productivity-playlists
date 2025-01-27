import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import PlaylistTimer from './PlaylistTimer';
import { logger } from '@/lib/logger';
import { PlaylistWithTasks } from '@/types/playlist';

type Task = PlaylistWithTasks['tasks'][0];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PlaylistPage({
  params
}: {
  params: { id: string }
}) {
  try {
    logger.info('Loading playlist:', params.id);
    
    // Get today's date at midnight in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date at midnight
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          },
          include: {
            completions: {
              where: {
                // Only get completions for exactly today's date
                date: {
                  gte: today,
                  lt: tomorrow
                }
              }
            }
          }
        }
      }
    });

    if (!playlist) {
      logger.warn('Playlist not found:', params.id);
      notFound();
    }

    // Transform tasks to include isCompleted based on today's completions
    const transformedPlaylist = {
      ...playlist,
      tasks: playlist.tasks.map((task: { completions: any[]; } & Task) => ({
        ...task,
        isCompleted: task.completions.length > 0
      }))
    };

    logger.info('Playlist loaded successfully:', playlist.name);

    // Calculate total duration
    const totalDuration = transformedPlaylist.tasks.reduce((acc: number, task: Task) => acc + task.duration, 0);
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;

    // Calculate completion percentage
    const completedTasks = transformedPlaylist.tasks.filter((task: Task) => task.isCompleted).length;
    const completionPercentage = (completedTasks / transformedPlaylist.tasks.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white border-b shadow-sm z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-900">{playlist.name}</h1>
              <div className="text-sm text-gray-500">
                {playlist.tasks.length} tasks
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium text-gray-900">{Math.round(completionPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <main className="max-w-4xl mx-auto p-4">
          <PlaylistTimer 
            playlist={playlist} 
            date={new Date().toISOString().split('T')[0]} 
          />
        </main>
      </div>
    );
  } catch (error) {
    logger.error('Failed to load playlist:', error);
    throw new Error('Failed to load playlist. Please try again later.');
  }
} 