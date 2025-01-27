import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const { isCompleted, date } = await request.json();
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Parse the target date
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    // Get next day for date range query
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    if (isCompleted) {
      // Create a completion record for the specific date
      await prisma.taskCompletion.create({
        data: {
          taskId: params.taskId,
          date: targetDate,
        },
      });
    } else {
      // Remove completion record for the specific date if it exists
      await prisma.taskCompletion.deleteMany({
        where: {
          taskId: params.taskId,
          date: {
            gte: targetDate,
            lt: nextDate
          }
        },
      });
    }

    logger.info(`Task ${params.taskId} ${isCompleted ? 'completed' : 'uncompleted'} for ${targetDate.toISOString()}`);
    
    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    logger.error('Failed to update task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
} 