import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
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
      return new NextResponse('Playlist not found', { status: 404 });
    }

    return NextResponse.json(playlist);
  } catch (error) {
    logger.error('Failed to fetch playlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    logger.info('Deleting playlist:', params.id);
    
    // First delete all tasks associated with the playlist
    await prisma.task.deleteMany({
      where: { playlistId: params.id }
    });

    // Then delete the playlist
    await prisma.playlist.delete({
      where: { id: params.id }
    });

    logger.info('Playlist deleted successfully:', params.id);
    return NextResponse.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete playlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { tasks, ...playlistData } = data;

    // Update playlist
    const updatedPlaylist = await prisma.playlist.update({
      where: { id: params.id },
      data: {
        ...playlistData,
        tasks: {
          // Delete tasks that are not in the updated list
          deleteMany: {
            playlistId: params.id,
            id: {
              notIn: tasks
                .filter((task: any) => task.id && !task.id.startsWith('temp-'))
                .map((task: any) => task.id),
            },
          },
          // Update existing tasks
          update: tasks
            .filter((task: any) => task.id && !task.id.startsWith('temp-'))
            .map((task: any) => ({
              where: { id: task.id },
              data: {
                title: task.title,
                duration: task.duration,
                order: task.order,
              },
            })),
          // Create new tasks
          create: tasks
            .filter((task: any) => !task.id || task.id.startsWith('temp-'))
            .map((task: any) => ({
              title: task.title,
              duration: task.duration,
              order: task.order,
              isCompleted: false,
            })),
        },
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return NextResponse.json(updatedPlaylist);
  } catch (error) {
    logger.error('Failed to update playlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 