import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { startOfDay, endOfDay } from 'date-fns';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    if (!dateParam) {
      logger.error('Date parameter is missing');
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    const start = startOfDay(date);
    const end = endOfDay(date);

    logger.info('Fetching playlists for:', { date: date.toISOString(), day: date.getDay() });

    const playlists = await prisma.playlist.findMany({
      where: {
        [['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]]: true
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          },
          include: {
            completions: {
              where: {
                date: {
                  gte: start,
                  lte: end
                }
              }
            }
          }
        }
      }
    });

    logger.info('Processing playlists with task completions');
    const playlistsWithStatus = playlists.map((playlist) => {
      // Log each task's completion status
      playlist.tasks.forEach(task => {
        logger.info('Task completion check:', {
          playlistId: playlist.id,
          taskId: task.id,
          taskTitle: task.title,
          isCompleted: task.isCompleted,
          completionsCount: task.completions.length,
          completions: task.completions.map(c => ({
            id: c.id,
            date: c.date.toISOString()
          }))
        });
      });

      const totalTasks = playlist.tasks.length;
      const completedTasks = playlist.tasks.filter(task => {
        // A task is completed if either it has completions for today or isCompleted is true
        const hasCompletion = task.completions.length > 0 || task.isCompleted;
        logger.info('Task completion status:', {
          taskId: task.id,
          taskTitle: task.title,
          isCompleted: task.isCompleted,
          hasCompletion,
          completionsCount: task.completions.length
        });
        return hasCompletion;
      }).length;
      
      let status = 'Not Started';
      if (totalTasks > 0 && completedTasks === totalTasks) {
        status = 'Completed';
      } else if (completedTasks > 0) {
        status = 'In Progress';
      }

      logger.info('Playlist status calculation:', {
        playlistId: playlist.id,
        playlistName: playlist.name,
        date: dateParam,
        totalTasks,
        completedTasks,
        status,
        tasks: playlist.tasks.map(t => ({
          id: t.id,
          title: t.title,
          isCompleted: t.isCompleted,
          completionsCount: t.completions.length
        }))
      });
      
      return {
        ...playlist,
        status,
        isCompleted: status === 'Completed',
        _debug: {
          date: dateParam,
          totalTasks,
          completedTasks,
          status,
          taskCompletions: playlist.tasks.map(t => ({
            taskId: t.id,
            isCompleted: t.isCompleted,
            completionsCount: t.completions.length
          }))
        }
      };
    });

    logger.info('Returning playlists with status:', playlistsWithStatus.map(p => ({
      id: p.id,
      name: p.name,
      isCompleted: p._debug
    })));

    return NextResponse.json(playlistsWithStatus);
  } catch (error) {
    logger.error('Failed to fetch playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
} 