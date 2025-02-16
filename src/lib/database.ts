import { SQLiteConnection, SQLiteDBConnection, CapacitorSQLite } from '@capacitor-community/sqlite';

class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize() {
    // If already initialized, return immediately
    if (this.initialized) {
      console.log('Database already initialized');
      return;
    }

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      console.log('Waiting for existing initialization to complete');
      return this.initializationPromise;
    }

    // Start new initialization
    this.initializationPromise = this._initialize();
    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async _initialize() {
    try {
      console.log('Starting database initialization...');

      // First, try to clean up any existing connections
      try {
        const isConn = await this.sqlite.isConnection("productivity_db", false);
        if (isConn.result) {
          console.log('Found existing connection, cleaning up...');
          const existingDb = await this.sqlite.retrieveConnection("productivity_db", false);
          await existingDb.close();
          await this.sqlite.closeConnection("productivity_db", false);
          console.log('Cleaned up existing connection');
        }
      } catch (cleanupError) {
        console.warn('Error during connection cleanup:', cleanupError);
      }

      // Check connections consistency
      await this.sqlite.checkConnectionsConsistency();
      console.log('Checked connections consistency');

      // Create a new connection
      console.log('Creating new connection');
      this.db = await this.sqlite.createConnection(
        "productivity_db",
        false,
        "no-encryption",
        1,
        false
      );

      // Open the database
      console.log('Opening database connection');
      await this.db.open();

      // Create tables
      console.log('Creating tables if they don\'t exist');
      await this.createTables();

      this.initialized = true;
      console.log('Database initialization completed successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      // Try to clean up if initialization fails
      try {
        if (this.db) {
          await this.db.close();
          await this.sqlite.closeConnection("productivity_db", false);
          this.db = null;
        }
      } catch (cleanupError) {
        console.error('Cleanup after initialization failure also failed:', cleanupError);
      }
      this.initialized = false;
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Create playlists table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        monday INTEGER DEFAULT 0,
        tuesday INTEGER DEFAULT 0,
        wednesday INTEGER DEFAULT 0,
        thursday INTEGER DEFAULT 0,
        friday INTEGER DEFAULT 0,
        saturday INTEGER DEFAULT 0,
        sunday INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tasks table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        playlist_id TEXT NOT NULL,
        title TEXT NOT NULL,
        duration INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE
      )
    `);

    // Create task_completions table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS task_completions (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
        UNIQUE(task_id, date)
      )
    `);

    // Create playlist_completions table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS playlist_completions (
        id TEXT PRIMARY KEY,
        playlist_id TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE,
        UNIQUE(playlist_id, date)
      )
    `);
  }

  // Playlist operations
  async createPlaylist(playlist: any) {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = crypto.randomUUID();
    await this.db.run(`
      INSERT INTO playlists (
        id, name, monday, tuesday, wednesday, thursday, friday, saturday, sunday
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      playlist.name,
      playlist.monday ? 1 : 0,
      playlist.tuesday ? 1 : 0,
      playlist.wednesday ? 1 : 0,
      playlist.thursday ? 1 : 0,
      playlist.friday ? 1 : 0,
      playlist.saturday ? 1 : 0,
      playlist.sunday ? 1 : 0
    ]);

    // Create tasks if provided
    if (playlist.tasks) {
      for (let i = 0; i < playlist.tasks.length; i++) {
        const task = playlist.tasks[i];
        await this.createTask({
          playlistId: id,
          title: task.title,
          duration: task.duration,
          order: i + 1
        });
      }
    }

    return id;
  }

  async getPlaylist(id: string, date?: string) {
    if (!this.db) throw new Error('Database not initialized');

    const playlist = await this.db.query(`
      SELECT * FROM playlists WHERE id = ?
    `, [id]);

    if (!playlist.values || playlist.values.length === 0) return null;

    const tasks = await this.getPlaylistTasks(id, date);
    return {
      ...playlist.values[0],
      tasks
    };
  }

  async getPlaylistsForDate(date: string) {
    if (!this.db) throw new Error('Database not initialized');

    const dayOfWeek = new Date(date).getDay();
    const dayColumn = [
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ][dayOfWeek];

    const playlists = await this.db.query(`
      SELECT * FROM playlists WHERE ${dayColumn} = 1
    `);

    if (!playlists.values) return [];

    return Promise.all(playlists.values.map(async (playlist) => {
      const tasks = await this.getPlaylistTasks(playlist.id, date);
      return {
        ...playlist,
        tasks
      };
    }));
  }

  // Task operations
  async createTask(task: any) {
    if (!this.db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    await this.db.run(`
      INSERT INTO tasks (id, playlist_id, title, duration, order_index)
      VALUES (?, ?, ?, ?, ?)
    `, [id, task.playlistId, task.title, task.duration, task.order]);

    return id;
  }

  async getPlaylistTasks(playlistId: string, date?: string) {
    if (!this.db) throw new Error('Database not initialized');

    const tasks = await this.db.query(`
      SELECT t.*, 
        CASE WHEN tc.task_id IS NOT NULL THEN 1 ELSE 0 END as is_completed
      FROM tasks t
      LEFT JOIN task_completions tc ON t.id = tc.task_id 
        AND tc.date = ?
      WHERE t.playlist_id = ?
      ORDER BY t.order_index
    `, [date || new Date().toISOString().split('T')[0], playlistId]);

    return tasks.values || [];
  }

  // Task completion operations
  async toggleTaskCompletion(taskId: string, date: string, isCompleted: boolean) {
    if (!this.db) throw new Error('Database not initialized');

    if (isCompleted) {
      await this.db.run(`
        INSERT OR IGNORE INTO task_completions (id, task_id, date)
        VALUES (?, ?, ?)
      `, [crypto.randomUUID(), taskId, date]);
    } else {
      await this.db.run(`
        DELETE FROM task_completions
        WHERE task_id = ? AND date = ?
      `, [taskId, date]);
    }
  }

  // Playlist completion operations
  async togglePlaylistCompletion(playlistId: string, date: string, isCompleted: boolean) {
    if (!this.db) throw new Error('Database not initialized');

    if (isCompleted) {
      await this.db.run(`
        INSERT OR IGNORE INTO playlist_completions (id, playlist_id, date)
        VALUES (?, ?, ?)
      `, [crypto.randomUUID(), playlistId, date]);
    } else {
      await this.db.run(`
        DELETE FROM playlist_completions
        WHERE playlist_id = ? AND date = ?
      `, [playlistId, date]);
    }
  }

  // Stats operations
  async getPlaylistStats(startDate: string, endDate: string) {
    if (!this.db) throw new Error('Database not initialized');

    const stats = await this.db.query(`
      SELECT 
        p.id as playlist_id,
        p.name as title,
        COUNT(DISTINCT pc.date) as completion_count
      FROM playlists p
      LEFT JOIN playlist_completions pc ON p.id = pc.playlist_id
        AND pc.date BETWEEN ? AND ?
      GROUP BY p.id, p.name
      HAVING completion_count > 0
      ORDER BY completion_count DESC
    `, [startDate, endDate]);

    return stats.values || [];
  }
}

export const db = new DatabaseService(); 