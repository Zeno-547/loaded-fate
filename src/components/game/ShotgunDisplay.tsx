import { cn } from '@/lib/utils';

interface ShotgunDisplayProps {
  shells: boolean[];
  currentIndex: number;
  revealedShell?: { index: number; loaded: boolean } | null;
  showAll?: boolean;
}

export function ShotgunDisplay({
  shells,
  currentIndex,
  revealedShell,
  showAll = false,
}: ShotgunDisplayProps) {
  return (
    <div className="glass-panel p-6">
      {/* Shotgun Visual */}
      <div className="relative mb-6">
        <div className="w-full h-20 bg-gradient-to-r from-secondary via-muted to-secondary rounded-lg flex items-center justify-center overflow-hidden">
          {/* Barrel */}
          <div className="w-3/4 h-8 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-full shadow-inner" />
          
          {/* Trigger guard */}
          <div className="absolute right-1/4 bottom-2 w-8 h-6 border-2 border-zinc-600 rounded-b-full" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-lg animate-pulse" />
      </div>

      {/* Chamber Info */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gradient">Chamber Status</h3>
        <p className="text-sm text-muted-foreground">
          {shells.length - currentIndex} shells remaining
        </p>
      </div>

      {/* Shell Indicators */}
      <div className="flex justify-center gap-2">
        {shells.map((isLoaded, index) => {
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          const isRevealed = revealedShell?.index === index;
          
          // Determine shell state
          let shellClass = 'unknown';
          if (isPast || showAll || isRevealed) {
            shellClass = isLoaded ? 'loaded' : 'empty';
          }

          return (
            <div
              key={index}
              className={cn(
                'shell-indicator relative',
                shellClass,
                isCurrent && 'ring-2 ring-accent ring-offset-2 ring-offset-background'
              )}
              title={isPast ? 'Fired' : isCurrent ? 'Current' : 'Upcoming'}
            >
              {/* Shell number */}
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                {index + 1}
              </span>
              
              {/* Current indicator */}
              {isCurrent && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-accent" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-8 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-6 rounded-full bg-shell-loaded" />
          <span>Loaded</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-6 rounded-full bg-shell-empty" />
          <span>Empty</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-6 rounded-full bg-shell-unknown opacity-60" />
          <span>Unknown</span>
        </div>
      </div>

      {/* Revealed shell info */}
      {revealedShell && (
        <div className={cn(
          'mt-4 p-3 rounded-lg text-center font-semibold animate-scale-in',
          revealedShell.loaded
            ? 'bg-destructive/20 text-destructive'
            : 'bg-success/20 text-success'
        )}>
          Current shell is {revealedShell.loaded ? 'LOADED' : 'EMPTY'}!
        </div>
      )}
    </div>
  );
}
