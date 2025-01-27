import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { date } = await request.json();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Create or update playlist completion
    const completion = await prisma.playlistCompletion.upsert({
      where: {
        playlistId_date: {
          playlistId: params.id,
          date: targetDate,
        },
      },
      update: {},
      create: {
        playlistId: params.id,
        date: targetDate,
      },
    });

    logger.info('Updated playlist completion:', {
      playlistId: params.id,
      date: targetDate,
      completionId: completion.id,
    });

    return NextResponse.json(completion);
  } catch (error) {
    logger.error('Failed to update playlist completion:', error);
    return NextResponse.json(
      { error: 'Failed to update playlist completion' },
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
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Delete the playlist completion for this date
    await prisma.playlistCompletion.deleteMany({
      where: {
        playlistId: params.id,
        date: targetDate,
      },
    });

    logger.info('Deleted playlist completion:', {
      playlistId: params.id,
      date: targetDate,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete playlist completion:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist completion' },
      { status: 500 }
    );
  }
} 