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
      <div className="h-[calc(100vh-4rem)] bg-gray-50 flex flex-col p-4">
        <div className="flex-1 grid grid-rows-[3fr_2fr] gap-4 min-h-0">
          <div className="bg-white overflow-hidden rounded-lg min-h-0 shadow-md border border-gray-100">
            <PlaylistsClient initialPlaylists={serializedPlaylists} />
          </div>
          <div className="bg-white overflow-hidden rounded-lg min-h-0 shadow-md border border-gray-100">
            <StatsWrapper />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    logger.error('Failed to fetch playlists:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name
    });
    throw new Error('Failed to load playlists. Please try again later.');
  }
} 