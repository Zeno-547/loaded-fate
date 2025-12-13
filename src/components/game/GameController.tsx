import { useState, useCallback } from 'react';
import { GameScreen } from '@/lib/gameTypes';
import { useGameState } from '@/hooks/useGameState';
import { useLobby } from '@/hooks/useLobby';
import { MainMenu } from './MainMenu';
import { GameLobby } from './GameLobby';
import { GameArena } from './GameArena';
import { SettingsPanel } from './SettingsPanel';
import { CreditsPanel } from './CreditsPanel';
import { Loader2 } from 'lucide-react';

export function GameController() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [lobbyId, setLobbyId] = useState<string | null>(null);

  const {
    loading: lobbyLoading,
    error: lobbyError,
    createLobby,
    joinLobby,
    leaveLobby,
  } = useLobby();

  const {
    lobby,
    players,
    gameState,
    messages,
    currentPlayer,
    myItems,
    loading: gameLoading,
    isMyTurn,
    isHost,
    revealedShell,
    startGame,
    shoot,
    useItem,
    sendChat,
  } = useGameState(lobbyId);

  const handleCreateLobby = useCallback(async (playerName: string) => {
    const newLobbyId = await createLobby(playerName);
    if (newLobbyId) {
      setLobbyId(newLobbyId);
      setScreen('lobby');
    }
  }, [createLobby]);

  const handleJoinLobby = useCallback(async (partyCode: string, playerName: string) => {
    const joinedLobbyId = await joinLobby(partyCode, playerName);
    if (joinedLobbyId) {
      setLobbyId(joinedLobbyId);
      setScreen('lobby');
    }
  }, [joinLobby]);

  const handleLeaveLobby = useCallback(async () => {
    if (lobbyId) {
      await leaveLobby(lobbyId);
    }
    setLobbyId(null);
    setScreen('menu');
  }, [lobbyId, leaveLobby]);

  const handleStartGame = useCallback(async () => {
    await startGame();
  }, [startGame]);

  // Auto-transition to game when lobby status changes
  if (lobby?.status === 'playing' && screen === 'lobby') {
    setScreen('game');
  }

  // Loading state
  if (gameLoading && lobbyId) {
    return (
      <div className="game-container flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  // Render based on screen
  switch (screen) {
    case 'menu':
      return (
        <MainMenu
          onCreateLobby={handleCreateLobby}
          onJoinLobby={handleJoinLobby}
          onSettings={() => setScreen('settings')}
          onCredits={() => setScreen('credits')}
          loading={lobbyLoading}
          error={lobbyError}
        />
      );

    case 'settings':
      return <SettingsPanel onBack={() => setScreen('menu')} />;

    case 'credits':
      return <CreditsPanel onBack={() => setScreen('menu')} />;

    case 'lobby':
      if (!lobby) {
        return (
          <div className="game-container flex items-center justify-center">
            <p className="text-muted-foreground">Lobby not found</p>
          </div>
        );
      }
      return (
        <GameLobby
          lobby={lobby}
          players={players}
          isHost={isHost || false}
          onStartGame={handleStartGame}
          onLeave={handleLeaveLobby}
        />
      );

    case 'game':
      if (!lobby || !gameState) {
        return (
          <div className="game-container flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        );
      }
      return (
        <GameArena
          lobby={lobby}
          players={players}
          gameState={gameState}
          messages={messages}
          currentPlayer={currentPlayer}
          myItems={myItems}
          isMyTurn={isMyTurn || false}
          revealedShell={revealedShell}
          onShoot={shoot}
          onUseItem={useItem}
          onSendChat={sendChat}
          onLeave={handleLeaveLobby}
        />
      );

    default:
      return <MainMenu
        onCreateLobby={handleCreateLobby}
        onJoinLobby={handleJoinLobby}
        onSettings={() => setScreen('settings')}
        onCredits={() => setScreen('credits')}
        loading={lobbyLoading}
        error={lobbyError}
      />;
  }
}
