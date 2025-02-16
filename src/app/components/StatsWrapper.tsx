interface StatsWrapperProps {
  totalTasks: number;
  completedTasks: number;
  activePlaylists: number;
  topPlaylists: Array<{
    id: string;
    name: string;
    completedTasks: number;
  }>;
}

export default function StatsWrapper({
  totalTasks,
  completedTasks,
  activePlaylists,
  topPlaylists
}: StatsWrapperProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <h2 className="text-xl font-poppins font-bold text-text-primary">Monthly Stats</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-text-secondary font-pt-sans">Total Tasks</p>
          <p className="text-3xl font-poppins font-bold text-text-primary">{totalTasks}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-text-secondary font-pt-sans">Completed Tasks</p>
          <p className="text-3xl font-poppins font-bold text-accent">{completedTasks}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-text-secondary font-pt-sans">Active Playlists</p>
          <p className="text-3xl font-poppins font-bold text-primary">{activePlaylists}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-text-secondary font-pt-sans">Completion Rate</p>
          <p className="text-3xl font-poppins font-bold text-text-primary">
            {Math.round((completedTasks / totalTasks) * 100)}%
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-poppins font-semibold text-text-primary">Progress</h3>
          <p className="text-sm text-text-secondary font-pt-sans">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
        
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
          />
        </div>
      </div>

      {topPlaylists.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-poppins font-semibold text-text-primary">Top Playlists</h3>
          <div className="space-y-3">
            {topPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="font-pt-sans text-text-primary">{playlist.name}</span>
                </div>
                <span className="text-sm text-text-secondary">
                  {playlist.completedTasks} tasks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 