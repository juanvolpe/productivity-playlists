'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePlaylistForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = [
    'monday', 'tuesday', 'wednesday', 'thursday',
    'friday', 'saturday', 'sunday'
  ];

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const data = {
      name: name.trim(),
      monday: selectedDays.includes('monday'),
      tuesday: selectedDays.includes('tuesday'),
      wednesday: selectedDays.includes('wednesday'),
      thursday: selectedDays.includes('thursday'),
      friday: selectedDays.includes('friday'),
      saturday: selectedDays.includes('saturday'),
      sunday: selectedDays.includes('sunday'),
    };

    console.log('Form values:', { name, selectedDays });
    console.log('Submitting data:', data);

    try {
      if (!name.trim()) {
        setError('Playlist name is required');
        setIsSubmitting(false);
        return;
      }

      if (selectedDays.length === 0) {
        setError('Please select at least one day');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Server response:', {
        status: response.status,
        data: responseData
      });

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create playlist');
      }

      setName('');
      setSelectedDays([]);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Playlist Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Days</label>
        <div className="mt-2 space-x-2">
          {days.map(day => (
            <label key={day} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectedDays.includes(day)}
                onChange={() => handleDayToggle(day)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
              <span className="ml-2 capitalize">{day}</span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Creating...' : 'Create Playlist'}
      </button>
    </form>
  );
} 