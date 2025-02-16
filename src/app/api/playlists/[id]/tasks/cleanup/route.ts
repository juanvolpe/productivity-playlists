import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const url = new URL(request.url);
  const dateParam = url.searchParams.get('date');
  
  try {
    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    logger.info('Starting cleanup transaction for playlist:', params.id, 'for date:', dateParam);

    // Extract just the date part (YYYY-MM-DD)
    const dateString = dateParam.split('T')[0];
    const targetDate = new Date(dateString);
    // Reset the time to midnight in the local timezone
    targetDate.setHours(0, 0, 0, 0);

    logger.info('Cleanup date:', {
      inputDate: dateParam,
      dateString,
      targetDate: targetDate.toISOString(),
      localDate: targetDate.toLocaleDateString()
    });

    // Use a transaction to ensure all deletions happen atomically
    const result = await prisma.$transaction(async (tx) => {
      // Get all tasks for this playlist
      const tasks = await tx.task.findMany({
        where: {
          playlistId: params.id
        },
        select: {
          id: true
        }
      });

      if (!tasks.length) {
        throw new Error('No tasks found for playlist');
      }

      // Delete ALL task completions for this playlist's tasks
      const taskCompletionResult = await tx.taskCompletion.deleteMany({
        where: {
          taskId: {
            in: tasks.map(task => task.id)
          }
        }
      });

      logger.info('Task completions deleted:', {
        count: taskCompletionResult.count,
        taskIds: tasks.map(t => t.id)
      });

      // Delete ALL playlist completions for this playlist
      const playlistCompletionResult = await tx.playlistCompletion.deleteMany({
        where: {
          playlistId: params.id
        }
      });

      logger.info('Playlist completions deleted:', {
        count: playlistCompletionResult.count,
        playlistId: params.id
      });

      return {
        taskCompletions: taskCompletionResult.count,
        playlistCompletion: playlistCompletionResult.count
      };
    });

    logger.info('Cleanup transaction completed successfully:', {
      playlistId: params.id,
      deletedCounts: result
    });
    
    return NextResponse.json({ 
      message: 'Cleanup completed successfully',
      result 
    });
  } catch (error) {
    logger.error('Failed to clean up tasks:', {
      error,
      playlistId: params.id,
      date: dateParam
    });
    
    return NextResponse.json(
      { error: 'Failed to clean up tasks: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 