import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('Fetching all playlists');

    const playlists = await prisma.playlist.findMany({
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    logger.info(`Found ${playlists.length} playlists`);
    return NextResponse.json(playlists);
  } catch (error) {
    logger.error('Failed to fetch playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    logger.info('Received request body:', body);

    // Extract name and handle both formats of day selection
    const { 
      name, 
      selectedDays,
      monday, tuesday, wednesday, thursday, friday, saturday, sunday,
      tasks: { create: tasksList } = { create: [] }
    } = body;

    // Validate name
    if (!name || typeof name !== 'string' || !name.trim()) {
      logger.error('Invalid name:', { name });
      return NextResponse.json(
        { error: 'Playlist name is required' },
        { status: 400 }
      );
    }

    // Validate tasks
    if (!Array.isArray(tasksList)) {
      logger.error('Invalid tasks format:', tasksList);
      return NextResponse.json(
        { error: 'Tasks must be an array' },
        { status: 400 }
      );
    }

    // Validate each task
    for (const task of tasksList) {
      if (!task.title || typeof task.title !== 'string' || !task.title.trim()) {
        logger.error('Invalid task title:', task);
        return NextResponse.json(
          { error: 'All tasks must have a title' },
          { status: 400 }
        );
      }
      if (typeof task.duration !== 'number' || task.duration < 1) {
        logger.error('Invalid task duration:', task);
        return NextResponse.json(
          { error: 'All tasks must have a valid duration' },
          { status: 400 }
        );
      }
    }

    // Convert individual day booleans to selectedDays array if needed
    const daysArray = selectedDays || [
      monday && 'monday',
      tuesday && 'tuesday',
      wednesday && 'wednesday',
      thursday && 'thursday',
      friday && 'friday',
      saturday && 'saturday',
      sunday && 'sunday'
    ].filter(Boolean);

    // Validate days
    if (!daysArray.length) {
      logger.error('No days selected');
      return NextResponse.json(
        { error: 'At least one day must be selected' },
        { status: 400 }
      );
    }

    // Validate days format
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    type ValidDay = typeof validDays[number];
    const invalidDays = daysArray.filter((day: string) => !validDays.includes(day as ValidDay));
    if (invalidDays.length > 0) {
      logger.error('Invalid days:', { invalidDays });
      return NextResponse.json(
        { error: `Invalid days: ${invalidDays.join(', ')}` },
        { status: 400 }
      );
    }

    logger.info('Creating playlist with:', { name, days: daysArray, taskCount: tasksList.length });

    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        monday: daysArray.includes('monday'),
        tuesday: daysArray.includes('tuesday'),
        wednesday: daysArray.includes('wednesday'),
        thursday: daysArray.includes('thursday'),
        friday: daysArray.includes('friday'),
        saturday: daysArray.includes('saturday'),
        sunday: daysArray.includes('sunday'),
        tasks: {
          create: tasksList.map((task, index) => ({
            title: task.title.trim(),
            duration: task.duration,
            isCompleted: false,
            order: task.order || index + 1
          }))
        }
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    logger.info('Created playlist:', playlist);
    return NextResponse.json(playlist);
  } catch (error) {
    logger.error('Failed to create playlist:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create playlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Playlist ID is required', { status: 400 });
    }

    await prisma.playlist.delete({
      where: { id }
    });

    return new NextResponse('Playlist deleted successfully');
  } catch (error) {
    logger.error('Failed to delete playlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 