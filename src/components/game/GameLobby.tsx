import { Button } from '@/components/ui/button';
import { GameLobby as GameLobbyType, GamePlayer } from '@/lib/gameTypes';
import { Copy, Users, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { soundManager } from '@/lib/soundManager';

interface GameLobbyProps {
  lobby: GameLobbyType;
  players: GamePlayer[];
  isHost: boolean;
  onStartGame: () => void;
  onLeave: () => void;
}

export function GameLobby({ lobby, players, isHost, onStartGame, onLeave }: GameLobbyProps) {
  const copyPartyCode = () => {
    navigator.clipboard.writeText(lobby.party_code);
    toast.success('Party code copied!');
    soundManager.playUIClick();
  };

  const canStart = players.length >= 2 && isHost;

  return (
    <div className="game-container flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-cinzel font-bold text-gradient mb-2">
            WAITING ROOM
          </h1>
          <p className="text-muted-foreground">
            Share the code to invite players
          </p>
        </div>

        {/* Party Code */}
        <div className="glass-panel p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Party Code
            </p>
            <button
              onClick={copyPartyCode}
              className="group flex items-center justify-center gap-3 mx-auto hover:scale-105 transition-transform"
            >
              <span className="text-4xl font-mono font-bold text-accent tracking-[0.3em]">
                {lobby.party_code}
              </span>
              <Copy className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="glass-panel p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">
              Players ({players.length}/{lobby.max_players})
            </h2>
          </div>

          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center font-bold">
                  {player.player_name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 font-medium">{player.player_name}</span>
                {player.session_id === lobby.host_id && (
                  <Crown className="w-5 h-5 text-accent" />
                )}
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: lobby.max_players - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border/50"
              >
                <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <span className="text-muted-foreground">Waiting for player...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onLeave}
            className="flex-1"
          >
            Leave
          </Button>
          {isHost ? (
            <Button
              onClick={onStartGame}
              disabled={!canStart}
              className="flex-1 action-button"
            >
              {players.length < 2 ? 'Need 2+ Players' : 'Start Game'}
            </Button>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Waiting for host to start...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
