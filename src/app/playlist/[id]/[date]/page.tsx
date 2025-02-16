import PlaylistDateClient from './PlaylistDateClient';
import { logger } from '@/lib/logger';

interface Props {
  params: {
    id: string;
    date: string;
  };
}

export default async function PlaylistDatePage({ params }: Props) {
  try {
    logger.info('Loading playlist for date:', {
      playlistId: params.id,
      date: params.date
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists/${params.id}?date=${params.date}`, {
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch playlist');
    }

    const playlist = await response.json();

    logger.info('Playlist loaded successfully:', {
      playlistId: params.id,
      name: playlist.name,
      taskCount: playlist.tasks.length,
      date: params.date
    });

    return (
      <PlaylistDateClient 
        playlist={playlist} 
        date={params.date}
      />
    );
  } catch (error) {
    logger.error('Failed to load playlist:', error);
    throw new Error('Failed to load playlist. Please try again later.');
  }
}