import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    
    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    logger.info('Cleaning up tasks for playlist:', params.id, 'for date:', dateParam);

    // Parse the target date
    const targetDate = new Date(dateParam);
    targetDate.setHours(0, 0, 0, 0);
    
    // Get next day for date range query
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Get all tasks for this playlist
    const tasks = await prisma.task.findMany({
      where: {
        playlistId: params.id
      },
      select: {
        id: true
      }
    });

    // Remove completion records for the specific date for these tasks
    await prisma.taskCompletion.deleteMany({
      where: {
        taskId: {
          in: tasks.map((task: { id: string }) => task.id)
        },
        date: {
          gte: targetDate,
          lt: nextDate
        }
      }
    });

    logger.info('Tasks cleaned up successfully for date:', dateParam);
    
    return NextResponse.json({ message: 'Tasks cleaned up successfully' });
  } catch (error) {
    logger.error('Failed to clean up tasks:', error);
    return NextResponse.json(
      { error: 'Failed to clean up tasks' },
      { status: 500 }
    );
  }
} 