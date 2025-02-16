import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { date } = await request.json();
    const playlistId = params.id;

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Parse the date in the local timezone
    const targetDate = new Date(date);
    // Reset the time to midnight in the local timezone
    targetDate.setHours(0, 0, 0, 0);

    logger.info('Creating playlist completion with date:', {
      inputDate: date,
      targetDate: targetDate.toISOString(),
      localDate: targetDate.toLocaleDateString(),
    });

    // Use upsert to avoid duplicate records
    const completion = await prisma.playlistCompletion.upsert({
      where: {
        playlistId_date: {
          playlistId,
          date: targetDate,
        },
      },
      update: {},
      create: {
        playlistId,
        date: targetDate,
      },
    });

    logger.info('Created/updated playlist completion:', {
      playlistId,
      date: targetDate.toISOString(),
      completionId: completion.id,
    });

    return NextResponse.json(completion);
  } catch (error) {
    logger.error('Failed to create/update playlist completion:', error);
    return NextResponse.json(
      { error: 'Failed to create/update playlist completion' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { date } = await request.json();
    const playlistId = params.id;

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Parse the date in the local timezone
    const targetDate = new Date(date);
    // Reset the time to midnight in the local timezone
    targetDate.setHours(0, 0, 0, 0);

    logger.info('Deleting playlist completion:', {
      inputDate: date,
      targetDate: targetDate.toISOString(),
      localDate: targetDate.toLocaleDateString(),
    });

    const result = await prisma.playlistCompletion.deleteMany({
      where: {
        playlistId,
        date: targetDate,
      },
    });

    logger.info('Deleted playlist completion:', {
      playlistId,
      date: targetDate.toISOString(),
      deletedCount: result.count,
    });

    return NextResponse.json({ success: true, deletedCount: result.count });
  } catch (error) {
    logger.error('Failed to delete playlist completion:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist completion' },
      { status: 500 }
    );
  }
} 