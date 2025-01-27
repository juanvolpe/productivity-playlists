export interface TaskCompletion {
  id: string;
  taskId: string;
  date: Date;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  duration: number;
  isCompleted: boolean;
  order: number;
  playlistId: string;
  createdAt: Date;
  updatedAt: Date;
  completions: TaskCompletion[];
}

export interface PlaylistWithTasks {
  id: string;
  name: string;
  tasks: Task[];
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  createdAt: Date;
  updatedAt: Date;
  isCompleted?: boolean;
  completions: PlaylistCompletion[];
  _debug?: {
    totalTasks: number;
    completedTasks: number;
    completedTaskIds: string[];
    date: string;
  };
}

export interface PlaylistCompletion {
  id: string;
  playlistId: string;
  date: Date;
  createdAt: Date;
}

export type PlaylistCreateInput = Omit<PlaylistWithTasks, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'completions'> & {
  tasks: {
    create: Array<{
      title: string;
      duration: number;
      isCompleted: boolean;
      order: number;
      completions?: {
        create: Array<{
          date: Date;
        }>;
      };
    }>;
  };
  completions?: {
    create: Array<{
      date: Date;
    }>;
  };
}; 