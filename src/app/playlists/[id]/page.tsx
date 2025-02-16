import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { PlaylistEditForm } from './PlaylistEditForm';

interface Props {
  params: {
    id: string;
  };
}

export default async function EditPlaylistPage({ params }: Props) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: params.id },
    include: {
      tasks: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  if (!playlist) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-poppins font-bold text-text-primary">Edit Playlist</h1>
      <PlaylistEditForm playlist={playlist} />
    </div>
  );
} 