import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
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

    // Create a date object for the target date
    const targetDate = new Date(dateParam);
    targetDate.setHours(0, 0, 0, 0);

    logger.info('Query date:', { 
      dateParam,
      targetDate: targetDate.toISOString(),
      localString: targetDate.toString()
    });

    const playlists = await prisma.playlist.findMany({
      where: {
        [['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][targetDate.getDay()]]: true
      },
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

    logger.info('Found playlists:', {
      count: playlists.length,
      playlists: playlists.map(p => ({
        id: p.id,
        name: p.name,
        taskCount: p.tasks.length,
        completionsCount: p.completions.length,
        completionDates: p.completions.map(c => c.date.toISOString())
      }))
    });

    const playlistsWithStatus = playlists.map((playlist) => {
      // Log each task's completion status
      playlist.tasks.forEach(task => {
        logger.info('Task completion check:', {
          playlistId: playlist.id,
          playlistName: playlist.name,
          taskId: task.id,
          taskTitle: task.title,
          completionsCount: task.completions.length,
          completionDates: task.completions.map(c => c.date.toISOString())
        });
      });

      const totalTasks = playlist.tasks.length;
      const completedTasks = playlist.tasks.filter(task => task.completions.length > 0).length;
      const hasPlaylistCompletion = playlist.completions.length > 0;
      
      let status = 'Not Started';
      if (hasPlaylistCompletion) {
        status = 'Completed';
      } else if (completedTasks > 0) {
        if (completedTasks === totalTasks) {
          status = 'Completed';
        } else {
          status = 'In Progress';
        }
      }

      logger.info('Playlist status calculation:', {
        playlistId: playlist.id,
        playlistName: playlist.name,
        date: dateParam,
        totalTasks,
        completedTasks,
        hasPlaylistCompletion,
        completionDates: playlist.completions.map(c => c.date.toISOString()),
        status
      });
      
      return {
        ...playlist,
        status,
        isCompleted: status === 'Completed',
        _debug: {
          date: dateParam,
          totalTasks,
          completedTasks,
          hasPlaylistCompletion,
          completionDates: playlist.completions.map(c => c.date.toISOString()),
          status
        }
      };
    });

    logger.info('Final playlist statuses:', playlistsWithStatus.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      isCompleted: p.isCompleted,
      debug: p._debug
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