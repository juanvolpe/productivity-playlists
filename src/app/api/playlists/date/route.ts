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
    const playlistsWithStatus = playlists.map(playlist => {
      const isCompleted = playlist.completions.length > 0;
      
      logger.info('Playlist completion check:', {
        playlistId: playlist.id,
        playlistName: playlist.name,
        completionsCount: playlist.completions.length,
        isCompleted,
        date: dateParam
      });
      
      return {
        ...playlist,
        isCompleted,
        _debug: {
          completionsCount: playlist.completions.length,
          date: dateParam
        }
      };
    });

    return NextResponse.json(playlistsWithStatus);
  } catch (error) {
    logger.error('Failed to fetch playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
} 