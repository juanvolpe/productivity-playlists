import { prisma } from './db';
import { logger } from './logger';

export async function getPlaylists() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[dayOfWeek];

  logger.info('Fetching playlists for:', currentDay, today.toDateString());

  const playlists = await prisma.playlist.findMany({
    where: {
      [currentDay]: true
    },
    include: {
      tasks: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  logger.info('Found', playlists.length, 'playlists for', currentDay);
  return playlists;
} 