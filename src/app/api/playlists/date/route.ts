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
          }
        },
        completions: {
          where: {
            date: {
              gte: start,
              lte: end
            }
          }
        }
      }
    });

    logger.info('Processing playlists with completions');
    const playlistsWithStatus = await Promise.all(playlists.map(async (playlist) => {
      // Check for playlist completion on this specific date
      const completion = await prisma.playlistCompletion.findFirst({
        where: {
          playlistId: playlist.id,
          date: {
            gte: start,
            lte: end
          }
        }
      });

      const isCompleted = completion !== null;
      
      logger.info('Playlist completion check:', {
        playlistId: playlist.id,
        playlistName: playlist.name,
        date: dateParam,
        isCompleted,
        completionId: completion?.id
      });
      
      return {
        ...playlist,
        isCompleted,
        _debug: {
          date: dateParam,
          isCompleted,
          completionId: completion?.id
        }
      };
    }));

    logger.info('Returning playlists with status:', playlistsWithStatus.map(p => ({
      id: p.id,
      name: p.name,
      isCompleted: p.isCompleted,
      _debug: p._debug
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