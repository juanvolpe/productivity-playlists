import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

function getCurrentDay(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date().getDay();
  return days[today];
}

export async function GET() {
  try {
    const today = getCurrentDay();
    logger.info('Fetching playlists for:', today);

    const playlists = await prisma.playlist.findMany({
      where: {
        [today]: true
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    logger.info(`Found ${playlists.length} playlists for ${today}`);
    return NextResponse.json(playlists);
  } catch (error) {
    logger.error('Failed to fetch today\'s playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
} 