import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function DELETE() {
  try {
    logger.info('Starting playlist cleanup');

    // Delete all tasks first due to foreign key constraints
    await prisma.task.deleteMany({});
    
    // Then delete all playlists
    await prisma.playlist.deleteMany({});

    logger.info('Successfully cleaned up all playlists and tasks');
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to clean up playlists:', error);
    return NextResponse.json(
      { error: 'Failed to clean up playlists' },
      { status: 500 }
    );
  }
} 