import { GamePlayer } from '@/lib/gameTypes';
import { Crown, Skull, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: GamePlayer;
  isCurrentTurn: boolean;
  isMe: boolean;
  isHost: boolean;
  onSelect?: () => void;
  selectable?: boolean;
}

export function PlayerCard({
  player,
  isCurrentTurn,
  isMe,
  isHost,
  onSelect,
  selectable = false,
}: PlayerCardProps) {
  const healthPercentage = (player.lives / 5) * 100;

  return (
    <div
      className={cn(
        'player-card cursor-default transition-all duration-300',
        isCurrentTurn && player.is_alive && 'active',
        !player.is_alive && 'eliminated',
        selectable && player.is_alive && 'cursor-pointer hover:scale-105 hover:border-primary/50'
      )}
      onClick={() => selectable && player.is_alive && onSelect?.()}
    >
      {/* Status Icons */}
      <div className="absolute top-2 right-2 flex gap-1">
        {isHost && <Crown className="w-4 h-4 text-accent" />}
        {isMe && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            You
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={cn(
            'relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold',
            player.is_alive
              ? 'bg-gradient-to-br from-primary/30 to-accent/30'
              : 'bg-muted'
          )}
        >
          {player.is_alive ? (
            player.player_name.charAt(0).toUpperCase()
          ) : (
            <Skull className="w-8 h-8 text-muted-foreground" />
          )}
          
          {/* Turn indicator */}
          {isCurrentTurn && player.is_alive && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {player.player_name}
          </h3>
          
          {/* Health Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Health</span>
              <span>{player.lives}/5</span>
            </div>
            <div className="health-bar">
              <div
                className="health-bar-fill"
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selection overlay */}
      {selectable && player.is_alive && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
          <span className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold">
            Select Target
          </span>
        </div>
      )}
    </div>
  );
}
