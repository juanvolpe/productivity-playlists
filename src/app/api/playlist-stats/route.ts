import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || '');
    const endDate = new Date(searchParams.get('endDate') || '');

    logger.info('Fetching playlist stats for period:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Get all playlists with their completions for the specified period
    const playlists = await prisma.playlist.findMany({
      include: {
        _count: {
          select: {
            completions: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate,
                }
              }
            }
          }
        }
      }
    });

    // Format the stats and include all playlists
    const formattedStats = playlists
      .map(playlist => ({
        playlistId: playlist.id,
        title: playlist.name,
        completionCount: playlist._count.completions
      }))
      // Filter out playlists with no completions and sort by completion count
      .filter(stat => stat.completionCount > 0)
      .sort((a, b) => b.completionCount - a.completionCount);

    logger.info('Playlist stats results:', {
      period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      totalPlaylists: playlists.length,
      playlistsWithCompletions: formattedStats.length,
      stats: formattedStats
    });

    return NextResponse.json(formattedStats);
  } catch (error) {
    logger.error('Failed to fetch playlist stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist stats' },
      { status: 500 }
    );
  }
} 