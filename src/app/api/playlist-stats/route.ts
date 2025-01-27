import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || '');
    const endDate = new Date(searchParams.get('endDate') || '');

    const stats = await prisma.playlist.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            completions: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
          },
        },
      },
    });

    const formattedStats = stats.map(playlist => ({
      playlistId: playlist.id,
      title: playlist.name,
      completionCount: playlist._count.completions,
    }));

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error('Failed to fetch playlist stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist stats' },
      { status: 500 }
    );
  }
} 