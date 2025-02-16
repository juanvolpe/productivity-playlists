import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt, playlistName } = await request.json();

    if (!prompt || !playlistName) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and playlistName' },
        { status: 400 }
      );
    }

    logger.info('Generating tasks with OpenAI:', {
      playlistName,
      promptLength: prompt.length,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates task lists. Return only a JSON array of tasks, where each task has a 'title' and 'duration' (in minutes) property. Example: [{\"title\": \"Task 1\", \"duration\": 30}, {\"title\": \"Task 2\", \"duration\": 15}]"
        },
        {
          role: "user",
          content: `Generate a list of tasks for a playlist named "${playlistName}". Additional context: ${prompt}. Return the response as a JSON array of tasks, where each task has a title and duration (in minutes).`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    try {
      const parsed = JSON.parse(content);
      const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : parsed;

      if (!Array.isArray(tasks)) {
        throw new Error('Response is not an array');
      }

      // Validate task format
      const validTasks = tasks.every(task => 
        typeof task.title === 'string' && 
        typeof task.duration === 'number' &&
        task.duration > 0
      );

      if (!validTasks) {
        throw new Error('Invalid task format in response');
      }

      logger.info('Successfully generated tasks:', {
        playlistName,
        taskCount: tasks.length,
      });

      return NextResponse.json({ tasks });
    } catch (parseError) {
      logger.error('Failed to parse OpenAI response:', {
        error: parseError,
        content,
      });
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    logger.error('Error generating tasks:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate tasks';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 