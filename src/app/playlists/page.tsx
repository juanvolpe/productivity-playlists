import { prisma } from '@/lib/db';
import PlaylistsClient from './PlaylistsClient';
import { logger } from '@/lib/logger';
import { StatsWrapper } from './StatsWrapper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PlaylistsPage() {
  try {
    logger.info('Fetching playlists for management page');
    
    const playlists = await prisma.playlist.findMany({
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          },
          include: {
            completions: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const serializedPlaylists = JSON.parse(JSON.stringify(playlists));
    
    return (
      <>
        <PlaylistsClient initialPlaylists={serializedPlaylists} />
        <StatsWrapper />
      </>
    );
  } catch (error) {
    logger.error('Failed to fetch playlists:', error);
    throw new Error('Failed to load playlists. Please try again later.');
  }
} 