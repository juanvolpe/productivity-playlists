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

    // Extract just the date part (YYYY-MM-DD)
    const dateString = date.split('T')[0];
    const targetDate = new Date(dateString);
    // Reset the time to midnight in the local timezone
    targetDate.setHours(0, 0, 0, 0);

    logger.info('Task completion date handling:', {
      inputDate: date,
      dateString,
      targetDate: targetDate.toISOString(),
      localDate: targetDate.toLocaleDateString(),
    });

    if (isCompleted) {
      // Create a completion record for the specific date
      await prisma.taskCompletion.upsert({
        where: {
          taskId_date: {
            taskId: params.taskId,
            date: targetDate,
          },
        },
        update: {},
        create: {
          taskId: params.taskId,
          date: targetDate,
        },
      });
    } else {
      // Remove completion record for the specific date if it exists
      await prisma.taskCompletion.deleteMany({
        where: {
          taskId: params.taskId,
          date: targetDate,
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