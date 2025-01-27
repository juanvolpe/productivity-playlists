import { prisma } from './db';
import type { Prisma } from '@prisma/client';
import { PlaylistWithTasks, PlaylistCreateInput, Task, TaskCompletion } from '@/types/playlist';
import { logger } from './logger';

export class PlaylistError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PlaylistError';
  }
}

export async function getTodaysPlaylists(): Promise<PlaylistWithTasks[]> {
  try {
    logger.info('Fetching today\'s playlists');
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    logger.debug('Today is:', today);

    const playlists = await prisma.playlist.findMany({
      where: {
        [today]: true
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          },
          include: {
            completions: true
          }
        }
      }
    });

    logger.info(`Found ${playlists.length} playlists for today`);
    return playlists;
  } catch (error) {
    logger.error('Failed to fetch today\'s playlists:', error);
    throw new PlaylistError('Failed to fetch playlists', 'FETCH_ERROR');
  }
}

export async function getAllPlaylists(): Promise<PlaylistWithTasks[]> {
  try {
    return await prisma.playlist.findMany({
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          },
          include: {
            completions: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch all playlists:', error);
    throw new PlaylistError('Failed to fetch playlists', 'FETCH_ERROR');
  }
}

export async function getPlaylistById(id: string): Promise<PlaylistWithTasks | null> {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          },
          include: {
            completions: true
          }
        }
      }
    });

    if (!playlist) {
      throw new PlaylistError('Playlist not found', 'NOT_FOUND');
    }

    return playlist;
  } catch (error) {
    if (error instanceof PlaylistError) throw error;
    console.error('Failed to fetch playlist:', error);
    throw new PlaylistError('Failed to fetch playlist', 'FETCH_ERROR');
  }
}

export async function createPlaylist(data: PlaylistCreateInput): Promise<PlaylistWithTasks> {
  try {
    const playlist = await prisma.playlist.create({
      data: {
        name: data.name,
        monday: data.monday,
        tuesday: data.tuesday,
        wednesday: data.wednesday,
        thursday: data.thursday,
        friday: data.friday,
        saturday: data.saturday,
        sunday: data.sunday,
        tasks: {
          create: data.tasks.create.map(task => ({
            title: task.title,
            duration: task.duration,
            isCompleted: task.isCompleted,
            order: task.order,
          }))
        }
      },
      include: {
        tasks: {
          include: {
            completions: true
          }
        }
      }
    });

    return {
      ...playlist,
      tasks: playlist.tasks.map((task: { completions?: TaskCompletion[] } & Task) => ({
        ...task,
        completions: task.completions || []
      }))
    };
  } catch (error) {
    console.error('Failed to create playlist:', error);
    throw new PlaylistError('Failed to create playlist', 'CREATE_ERROR');
  }
}

export async function deletePlaylist(id: string): Promise<void> {
  try {
    await prisma.playlist.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Failed to delete playlist:', error);
    throw new PlaylistError('Failed to delete playlist', 'DELETE_ERROR');
  }
}

export async function updateTaskStatus(
  taskId: string, 
  isCompleted: boolean
): Promise<{ id: string; isCompleted: boolean }> {
  try {
    return await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted },
      select: { id: true, isCompleted: true }
    });
  } catch (error) {
    console.error('Failed to update task status:', error);
    throw new PlaylistError('Failed to update task', 'UPDATE_ERROR');
  }
} 