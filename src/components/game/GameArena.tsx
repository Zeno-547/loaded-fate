import { useState } from 'react';
import { GameLobby, GamePlayer, GameState, GameMessage, PlayerItem } from '@/lib/gameTypes';
import { PlayerCard } from './PlayerCard';
import { ShotgunDisplay } from './ShotgunDisplay';
import { ItemInventory } from './ItemInventory';
import { ActionPanel } from './ActionPanel';
import { ChatPanel } from './ChatPanel';
import { Button } from '@/components/ui/button';
import { Trophy, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameArenaProps {
  lobby: GameLobby;
  players: GamePlayer[];
  gameState: GameState;
  messages: GameMessage[];
  currentPlayer: GamePlayer | null;
  myItems: PlayerItem[];
  isMyTurn: boolean;
  revealedShell: { index: number; loaded: boolean } | null;
  onShoot: (targetPlayerId: string) => void;
  onUseItem: (item: PlayerItem) => void;
  onSendChat: (message: string) => void;
  onLeave: () => void;
}

export function GameArena({
  lobby,
  players,
  gameState,
  messages,
  currentPlayer,
  myItems,
  isMyTurn,
  revealedShell,
  onShoot,
  onUseItem,
  onSendChat,
  onLeave,
}: GameArenaProps) {
  const [showingResult, setShowingResult] = useState(false);

  const shells = gameState.shells as boolean[];
  const winner = players.find((p) => p.id === gameState.winner_id);
  const isGameOver = lobby.status === 'finished' && winner;

  const currentTurnPlayer = players.find(
    (p) => p.id === gameState.current_turn_player_id
  );

  // Separate my player from others
  const otherPlayers = players.filter((p) => p.id !== currentPlayer?.id);

  const handleShoot = async (targetId: string) => {
    setShowingResult(true);
    await onShoot(targetId);
    setTimeout(() => setShowingResult(false), 1000);
  };

  if (isGameOver) {
    return (
      <div className="game-container flex items-center justify-center p-4">
        <div className="max-w-lg w-full animate-scale-in">
          <div className="glass-panel p-8 text-center">
            <div className="mb-6">
              <Trophy className="w-20 h-20 mx-auto text-accent animate-float" />
            </div>
            <h1 className="text-4xl font-cinzel font-bold text-gradient mb-4">
              GAME OVER
            </h1>
            <p className="text-2xl mb-2">
              <span className="text-accent">{winner.player_name}</span> wins!
            </p>
            <p className="text-muted-foreground mb-8">
              Survived with {winner.lives} lives remaining
            </p>

            <Button onClick={onLeave} variant="outline" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Return to Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-cinzel font-bold text-gradient">
              ROULETTE
            </h1>
            <p className="text-sm text-muted-foreground">
              Code: {lobby.party_code}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {currentTurnPlayer && (
              <div className={cn(
                'px-4 py-2 rounded-lg',
                isMyTurn ? 'bg-primary/20 text-primary' : 'bg-secondary'
              )}>
                {isMyTurn ? "Your Turn" : `${currentTurnPlayer.player_name}'s Turn`}
              </div>
            )}
            
            <Button variant="outline" size="sm" onClick={onLeave}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Other Players */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Players
            </h2>
            {otherPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isCurrentTurn={player.id === gameState.current_turn_player_id}
                isMe={false}
                isHost={player.session_id === lobby.host_id}
              />
            ))}

            {/* Current Player */}
            {currentPlayer && (
              <>
                <div className="border-t border-border pt-4 mt-4">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    You
                  </h2>
                  <PlayerCard
                    player={currentPlayer}
                    isCurrentTurn={currentPlayer.id === gameState.current_turn_player_id}
                    isMe={true}
                    isHost={currentPlayer.session_id === lobby.host_id}
                  />
                </div>
              </>
            )}
          </div>

          {/* Center Column - Shotgun & Actions */}
          <div className="lg:col-span-1 space-y-4">
            <ShotgunDisplay
              shells={shells}
              currentIndex={gameState.current_shell_index}
              revealedShell={revealedShell}
            />

            {currentPlayer && currentPlayer.is_alive && (
              <ActionPanel
                players={players}
                currentPlayer={currentPlayer}
                isHost={currentPlayer.session_id === lobby.host_id}
                hostSessionId={lobby.host_id}
                onShoot={handleShoot}
                disabled={!isMyTurn || showingResult}
              />
            )}

            {currentPlayer && !currentPlayer.is_alive && (
              <div className="glass-panel p-6 text-center">
                <p className="text-muted-foreground">
                  You have been eliminated. Watching as spectator...
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Items */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Items
            </h2>

            {currentPlayer && (
              <ItemInventory
                items={myItems}
                onUseItem={onUseItem}
                disabled={!isMyTurn || !currentPlayer.is_alive}
              />
            )}

            {/* Quick Rules */}
            <div className="glass-panel p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Quick Rules
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Shoot yourself (empty) = another turn</li>
                <li>• Shoot other (hit) = another turn</li>
                <li>• 5 lives each, 0 = eliminated</li>
                <li>• Last player standing wins</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Chat */}
        <ChatPanel
          messages={messages}
          players={players}
          onSendMessage={onSendChat}
        />
      </div>
    </div>
  );
}
