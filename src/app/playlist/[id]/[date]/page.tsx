import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import PlaylistTimer from '../../[id]/PlaylistTimer';
import { logger } from '@/lib/logger';
import { PlaylistWithTasks } from '@/types/playlist';

type Task = PlaylistWithTasks['tasks'][0];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PlaylistDatePage({
  params
}: {
  params: { id: string; date: string }
}) {
  try {
    logger.info('Loading playlist:', params.id, 'for date:', params.date);
    
    // Parse the date from URL
    const targetDate = new Date(params.date);
    targetDate.setHours(0, 0, 0, 0);
    
    // Get next day for date range query
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Add this before the main query
    const taskCount = await prisma.task.count({
      where: {
        playlistId: params.id
      }
    });

    logger.info('Task count for playlist:', {
      playlistId: params.id,
      taskCount
    });

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
                date: {
                  gte: targetDate,
                  lt: nextDate
                }
              }
            }
          }
        }
      }
    });

    // Add this debug logging right after the query
    logger.info('Database query result:', {
      id: playlist?.id,
      name: playlist?.name,
      rawTaskCount: playlist?.tasks?.length,
      rawTasks: playlist?.tasks,
      targetDate: targetDate.toISOString(),
      nextDate: nextDate.toISOString()
    });

    // Enhanced debug logging
    logger.info('Raw playlist data:', {
      id: playlist?.id,
      name: playlist?.name,
      taskCount: playlist?.tasks?.length,
      tasks: playlist?.tasks.map(t => ({
        id: t.id,
        title: t.title,
        duration: t.duration,
        order: t.order,
        completions: t.completions.length
      }))
    });

    if (!playlist) {
      logger.warn('Playlist not found:', params.id);
      notFound();
    }

    // Transform tasks to include isCompleted based on target date's completions
    const transformedPlaylist = {
      ...playlist,
      tasks: playlist.tasks.map((task: { completions: any[]; } & Task) => ({
        ...task,
        isCompleted: task.completions.length > 0
      }))
    };

    // Debug transformed playlist
    logger.info('Transformed playlist data:', {
      id: transformedPlaylist.id,
      name: transformedPlaylist.name,
      taskCount: transformedPlaylist.tasks.length,
      tasks: transformedPlaylist.tasks.map(t => ({
        id: t.id,
        title: t.title,
        duration: t.duration,
        order: t.order,
        isCompleted: t.isCompleted
      }))
    });

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
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{playlist.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(params.date).toLocaleDateString(undefined, { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
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
            playlist={transformedPlaylist} 
            date={params.date} 
          />
        </main>
      </div>
    );
  } catch (error) {
    logger.error('Failed to load playlist:', error);
    throw new Error('Failed to load playlist. Please try again later.');
  }
} 