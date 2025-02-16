import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { tasks } = await request.json();
    const playlistId = params.id;

    // Validate input
    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Invalid tasks format' },
        { status: 400 }
      );
    }

    // Get the current highest order
    const highestOrderTask = await prisma.task.findFirst({
      where: { playlistId },
      orderBy: { order: 'desc' },
    });

    const startOrder = (highestOrderTask?.order ?? -1) + 1;

    // Create all tasks in a transaction
    const createdTasks = await prisma.$transaction(
      tasks.map((task, index) => 
        prisma.task.create({
          data: {
            title: task.title,
            duration: task.duration,
            playlistId,
            order: startOrder + index,
          },
        })
      )
    );

    logger.info('Created AI-generated tasks:', {
      playlistId,
      taskCount: createdTasks.length,
    });

    return NextResponse.json({ tasks: createdTasks });
  } catch (error) {
    logger.error('Failed to create tasks:', error);
    return NextResponse.json(
      { error: 'Failed to create tasks' },
      { status: 500 }
    );
  }
} 