import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

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

    logger.info('Fetching playlist with date:', {
      inputDate: date,
      dateString,
      targetDate: targetDate.toISOString(),
      localDate: targetDate.toLocaleDateString(),
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
                date: targetDate
              }
            }
          }
        },
        completions: {
          where: {
            date: targetDate
          }
        }
      }
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Transform tasks to include isCompleted based on target date's completions
    const transformedPlaylist = {
      ...playlist,
      tasks: playlist.tasks.map(task => ({
        ...task,
        isCompleted: task.completions.length > 0
      })),
      completions: playlist.completions || []
    };

    logger.info('Transformed playlist:', {
      playlistId: params.id,
      date: dateString,
      taskCount: transformedPlaylist.tasks.length,
      completedTasks: transformedPlaylist.tasks.filter(t => t.isCompleted).length,
      hasPlaylistCompletion: transformedPlaylist.completions.length > 0
    });

    return NextResponse.json(transformedPlaylist);
  } catch (error) {
    logger.error('Failed to fetch playlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;

    const deletedPlaylist = await prisma.playlist.delete({
      where: { id: playlistId },
    });

    logger.info('Deleted playlist:', {
      playlistId,
      name: deletedPlaylist.name,
    });

    return NextResponse.json(deletedPlaylist);
  } catch (error) {
    logger.error('Failed to delete playlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, tasks, ...activeDays } = await request.json();
    const playlistId = params.id;

    // Update playlist and tasks in a transaction
    const updatedPlaylist = await prisma.$transaction(async (tx) => {
      // Update playlist
      const playlist = await tx.playlist.update({
        where: { id: playlistId },
        data: {
          name,
          ...activeDays,
        },
      });

      // Delete tasks that are not in the new list
      const existingTasks = await tx.task.findMany({
        where: { playlistId },
        select: { id: true },
      });

      const existingTaskIds = existingTasks.map(t => t.id);
      const newTaskIds = tasks
        .filter((t: any) => t.id && !t.id.startsWith('new-task-'))
        .map((t: any) => t.id);

      const tasksToDelete = existingTaskIds.filter(id => !newTaskIds.includes(id));

      if (tasksToDelete.length > 0) {
        await tx.task.deleteMany({
          where: {
            id: { in: tasksToDelete },
          },
        });
      }

      // Update or create tasks
      for (const task of tasks) {
        if (task.id && !task.id.startsWith('new-task-')) {
          // Update existing task
          await tx.task.update({
            where: { id: task.id },
            data: {
              title: task.title,
              duration: task.duration,
              order: task.order,
            },
          });
        } else {
          // Create new task
          await tx.task.create({
            data: {
              title: task.title,
              duration: task.duration,
              order: task.order,
              playlistId,
              isCompleted: false,
            },
          });
        }
      }

      return playlist;
    });

    logger.info('Updated playlist:', {
      playlistId,
      name: updatedPlaylist.name,
      taskCount: tasks.length,
    });

    return NextResponse.json(updatedPlaylist);
  } catch (error) {
    logger.error('Failed to update playlist:', error);
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    );
  }
} 