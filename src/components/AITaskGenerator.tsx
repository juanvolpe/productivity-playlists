import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface Task {
  title: string;
  duration: number;
}

interface AITaskGeneratorProps {
  playlistName: string;
  onTasksGenerated: (tasks: Task[]) => void;
}

export function AITaskGenerator({ playlistName, onTasksGenerated }: AITaskGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    try {
      setError('');
      setIsGenerating(true);

      if (!prompt.trim()) {
        throw new Error('Please enter a description for the tasks you want to generate');
      }

      if (!playlistName.trim()) {
        throw new Error('Playlist name is required');
      }

      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          playlistName: playlistName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tasks');
      }

      if (!Array.isArray(data.tasks) || data.tasks.length === 0) {
        throw new Error('No tasks were generated. Please try again with a different description.');
      }

      onTasksGenerated(data.tasks);
      setShowPrompt(false);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tasks');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {!showPrompt ? (
        <button
          type="button"
          onClick={() => setShowPrompt(true)}
          className="w-full text-xs py-1.5 px-3 rounded-md border border-gray-200 text-text-secondary hover:text-primary hover:border-accent transition-colors"
        >
          Generate Tasks using AI
        </button>
      ) : (
        <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
          <Textarea
            placeholder="Describe what kind of tasks you want to generate... (e.g., 'Create a morning routine with at least 5 tasks including exercise and meditation')"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setError('');
            }}
            className="min-h-[80px] text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`flex-1 text-xs py-1.5 px-3 rounded-md text-white transition-colors ${
                isGenerating 
                  ? 'bg-primary hover:bg-primary-light' 
                  : 'bg-accent hover:bg-primary'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPrompt(false);
                setPrompt('');
                setError('');
              }}
              className="text-xs py-1.5 px-3 rounded-md border border-gray-200 text-text-secondary hover:text-primary hover:border-accent transition-colors"
            >
              Cancel
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 