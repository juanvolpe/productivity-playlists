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
    const todayDate = new Date();
    const startOfDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    logger.debug('Today is:', today);

    const prismaPlaylists = await prisma.playlist.findMany({
      where: {
        [today]: true
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
                  gte: startOfDay,
                  lt: endOfDay
                }
              }
            }
          }
        },
        completions: {
          where: {
            date: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        }
      }
    });

    const playlists: PlaylistWithTasks[] = prismaPlaylists.map(playlist => {
      const totalTasks = playlist.tasks.length;
      const completedTasks = playlist.tasks.filter(task => 
        task.completions.length > 0 || task.isCompleted
      ).length;

      logger.info('Playlist completion status:', {
        playlistId: playlist.id,
        playlistName: playlist.name,
        totalTasks,
        completedTasks,
        taskCompletions: playlist.tasks.map(t => ({
          taskId: t.id,
          title: t.title,
          completionsCount: t.completions.length,
          isCompleted: t.isCompleted
        }))
      });

      let status: 'Not Started' | 'Completed' | 'In Progress' = 'Not Started';
      if (totalTasks > 0 && completedTasks === totalTasks) {
        status = 'Completed';
      } else if (completedTasks > 0) {
        status = 'In Progress';
      }

      return {
        id: playlist.id,
        name: playlist.name,
        monday: playlist.monday,
        tuesday: playlist.tuesday,
        wednesday: playlist.wednesday,
        thursday: playlist.thursday,
        friday: playlist.friday,
        saturday: playlist.saturday,
        sunday: playlist.sunday,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
        status,
        isCompleted: status === 'Completed',
        tasks: playlist.tasks.map(task => ({
          id: task.id,
          title: task.title,
          duration: task.duration,
          isCompleted: task.isCompleted,
          order: task.order,
          playlistId: task.playlistId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          completions: task.completions
        })),
        completions: playlist.completions
      };
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
    const prismaPlaylists = await prisma.playlist.findMany({
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          },
          include: {
            completions: true
          }
        },
        completions: true
      }
    });

    return prismaPlaylists.map(playlist => {
      const totalTasks = playlist.tasks.length;
      const completedTasks = playlist.tasks.filter(task => 
        task.completions.length > 0 || task.isCompleted
      ).length;

      let status: 'Not Started' | 'Completed' | 'In Progress' = 'Not Started';
      if (totalTasks > 0 && completedTasks === totalTasks) {
        status = 'Completed';
      } else if (completedTasks > 0) {
        status = 'In Progress';
      }

      return {
        id: playlist.id,
        name: playlist.name,
        monday: playlist.monday,
        tuesday: playlist.tuesday,
        wednesday: playlist.wednesday,
        thursday: playlist.thursday,
        friday: playlist.friday,
        saturday: playlist.saturday,
        sunday: playlist.sunday,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
        status,
        isCompleted: status === 'Completed',
        tasks: playlist.tasks.map(task => ({
          id: task.id,
          title: task.title,
          duration: task.duration,
          isCompleted: task.isCompleted,
          order: task.order,
          playlistId: task.playlistId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          completions: task.completions
        })),
        completions: playlist.completions
      };
    });
  } catch (error) {
    console.error('Failed to fetch all playlists:', error);
    throw new PlaylistError('Failed to fetch playlists', 'FETCH_ERROR');
  }
}

export async function getPlaylistById(id: string, date?: string): Promise<PlaylistWithTasks | null> {
  try {
    let startOfDay: Date;
    let endOfDay: Date;

    if (date) {
      startOfDay = new Date(date);
    } else {
      const today = new Date();
      startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
    endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const prismaPlaylist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          },
          include: {
            completions: {
              where: {
                date: {
                  gte: startOfDay,
                  lt: endOfDay
                }
              }
            }
          }
        },
        completions: {
          where: {
            date: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        }
      }
    });

    if (!prismaPlaylist) {
      throw new PlaylistError('Playlist not found', 'NOT_FOUND');
    }

    const totalTasks = prismaPlaylist.tasks.length;
    const completedTasks = prismaPlaylist.tasks.filter(task => 
      task.completions.length > 0 || task.isCompleted
    ).length;

    logger.info('Playlist completion status:', {
      playlistId: prismaPlaylist.id,
      playlistName: prismaPlaylist.name,
      date: startOfDay.toISOString(),
      totalTasks,
      completedTasks,
      taskCompletions: prismaPlaylist.tasks.map(t => ({
        taskId: t.id,
        title: t.title,
        completionsCount: t.completions.length,
        isCompleted: t.isCompleted
      }))
    });

    let status: 'Not Started' | 'Completed' | 'In Progress' = 'Not Started';
    if (totalTasks > 0 && completedTasks === totalTasks) {
      status = 'Completed';
    } else if (completedTasks > 0) {
      status = 'In Progress';
    }

    return {
      id: prismaPlaylist.id,
      name: prismaPlaylist.name,
      monday: prismaPlaylist.monday,
      tuesday: prismaPlaylist.tuesday,
      wednesday: prismaPlaylist.wednesday,
      thursday: prismaPlaylist.thursday,
      friday: prismaPlaylist.friday,
      saturday: prismaPlaylist.saturday,
      sunday: prismaPlaylist.sunday,
      createdAt: prismaPlaylist.createdAt,
      updatedAt: prismaPlaylist.updatedAt,
      status,
      isCompleted: status === 'Completed',
      tasks: prismaPlaylist.tasks.map(task => ({
        id: task.id,
        title: task.title,
        duration: task.duration,
        isCompleted: task.isCompleted,
        order: task.order,
        playlistId: task.playlistId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completions: task.completions
      })),
      completions: prismaPlaylist.completions
    };
  } catch (error) {
    if (error instanceof PlaylistError) throw error;
    console.error('Failed to fetch playlist:', error);
    throw new PlaylistError('Failed to fetch playlist', 'FETCH_ERROR');
  }
}

export async function createPlaylist(data: PlaylistCreateInput): Promise<PlaylistWithTasks> {
  try {
    const prismaPlaylist = await prisma.playlist.create({
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
        },
        completions: true
      }
    });

    // Calculate status for the newly created playlist
    const totalTasks = prismaPlaylist.tasks.length;
    const completedTasks = prismaPlaylist.tasks.filter(task => 
      task.completions.length > 0 || task.isCompleted
    ).length;

    let status: 'Not Started' | 'Completed' | 'In Progress' = 'Not Started';
    if (totalTasks > 0 && completedTasks === totalTasks) {
      status = 'Completed';
    } else if (completedTasks > 0) {
      status = 'In Progress';
    }

    return {
      id: prismaPlaylist.id,
      name: prismaPlaylist.name,
      monday: prismaPlaylist.monday,
      tuesday: prismaPlaylist.tuesday,
      wednesday: prismaPlaylist.wednesday,
      thursday: prismaPlaylist.thursday,
      friday: prismaPlaylist.friday,
      saturday: prismaPlaylist.saturday,
      sunday: prismaPlaylist.sunday,
      createdAt: prismaPlaylist.createdAt,
      updatedAt: prismaPlaylist.updatedAt,
      status,
      isCompleted: status === 'Completed',
      tasks: prismaPlaylist.tasks.map(task => ({
        id: task.id,
        title: task.title,
        duration: task.duration,
        isCompleted: task.isCompleted,
        order: task.order,
        playlistId: task.playlistId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completions: task.completions
      })),
      completions: prismaPlaylist.completions
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