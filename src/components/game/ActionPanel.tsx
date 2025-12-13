import { useState } from 'react';
import { GamePlayer } from '@/lib/gameTypes';
import { PlayerCard } from './PlayerCard';
import { Button } from '@/components/ui/button';
import { Target, User, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionPanelProps {
  players: GamePlayer[];
  currentPlayer: GamePlayer;
  isHost: boolean;
  hostSessionId: string;
  onShoot: (targetPlayerId: string) => void;
  disabled?: boolean;
}

export function ActionPanel({
  players,
  currentPlayer,
  isHost,
  hostSessionId,
  onShoot,
  disabled = false,
}: ActionPanelProps) {
  const [mode, setMode] = useState<'select' | 'action'>('action');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const alivePlayers = players.filter((p) => p.is_alive);
  const otherPlayers = alivePlayers.filter((p) => p.id !== currentPlayer.id);

  const handleShootSelf = () => {
    onShoot(currentPlayer.id);
    setMode('action');
  };

  const handleShootOther = () => {
    if (otherPlayers.length === 1) {
      onShoot(otherPlayers[0].id);
    } else {
      setMode('select');
    }
  };

  const handleSelectTarget = (playerId: string) => {
    setSelectedTarget(playerId);
  };

  const confirmShot = () => {
    if (selectedTarget) {
      onShoot(selectedTarget);
      setSelectedTarget(null);
      setMode('action');
    }
  };

  if (disabled) {
    return (
      <div className="glass-panel p-6 text-center">
        <p className="text-muted-foreground">Waiting for your turn...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      {mode === 'action' ? (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-gradient">Your Turn</h3>
            <p className="text-sm text-muted-foreground">
              Choose your action wisely...
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Shoot Self */}
            <button
              onClick={handleShootSelf}
              className={cn(
                'p-6 rounded-xl border-2 border-border/50 transition-all duration-300',
                'hover:border-accent hover:bg-accent/10 group'
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-accent" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Shoot Yourself</p>
                  <p className="text-xs text-muted-foreground">
                    Empty = Another turn
                  </p>
                </div>
              </div>
            </button>

            {/* Shoot Other */}
            <button
              onClick={handleShootOther}
              disabled={otherPlayers.length === 0}
              className={cn(
                'p-6 rounded-xl border-2 border-border/50 transition-all duration-300',
                'hover:border-primary hover:bg-primary/10 group',
                otherPlayers.length === 0 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Shoot Other</p>
                  <p className="text-xs text-muted-foreground">
                    Hit = Another turn
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode('action');
                setSelectedTarget(null);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h3 className="font-semibold">Select Target</h3>
          </div>

          <div className="space-y-3">
            {otherPlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => handleSelectTarget(player.id)}
                className={cn(
                  'cursor-pointer transition-all',
                  selectedTarget === player.id && 'ring-2 ring-primary rounded-xl'
                )}
              >
                <PlayerCard
                  player={player}
                  isCurrentTurn={false}
                  isMe={false}
                  isHost={player.session_id === hostSessionId}
                />
              </div>
            ))}
          </div>

          {selectedTarget && (
            <Button
              onClick={confirmShot}
              className="w-full action-button danger-button mt-4"
            >
              <Target className="w-5 h-5 mr-2" />
              Confirm Shot
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
