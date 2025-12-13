import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameLobby, GamePlayer, GameState, GameMessage, PlayerItem, ShootResult } from '@/lib/gameTypes';
import { getStoredSessionId, generateShells, generateRandomItems } from '@/lib/gameUtils';
import { soundManager } from '@/lib/soundManager';

export function useGameState(lobbyId: string | null) {
  const [lobby, setLobby] = useState<GameLobby | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);
  const [myItems, setMyItems] = useState<PlayerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedShell, setRevealedShell] = useState<{ index: number; loaded: boolean } | null>(null);

  const sessionId = getStoredSessionId();

  // Fetch initial data
  const fetchGameData = useCallback(async () => {
    if (!lobbyId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch lobby
      const { data: lobbyData, error: lobbyError } = await supabase
        .from('game_lobbies')
        .select('*')
        .eq('id', lobbyId)
        .single();

      if (lobbyError) throw lobbyError;
      setLobby(lobbyData as GameLobby);

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('game_players')
        .select('*')
        .eq('lobby_id', lobbyId)
        .order('turn_order', { ascending: true });

      if (playersError) throw playersError;
      setPlayers(playersData as GamePlayer[]);

      // Find current player
      const me = playersData?.find((p: GamePlayer) => p.session_id === sessionId);
      setCurrentPlayer(me || null);

      // Fetch game state if game has started
      if (lobbyData?.status === 'playing' || lobbyData?.status === 'finished') {
        const { data: stateData, error: stateError } = await supabase
          .from('game_state')
          .select('*')
          .eq('lobby_id', lobbyId)
          .single();

        if (stateError && stateError.code !== 'PGRST116') throw stateError;
        if (stateData) {
          setGameState({
            ...stateData,
            shells: stateData.shells as boolean[]
          } as GameState);
        }
      }

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('game_messages')
        .select('*')
        .eq('lobby_id', lobbyId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;
      setMessages(messagesData as GameMessage[]);

      // Fetch my items
      if (me) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('player_items')
          .select('*')
          .eq('player_id', me.id)
          .eq('is_used', false);

        if (itemsError) throw itemsError;
        setMyItems(itemsData as PlayerItem[]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching game data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load game');
      setLoading(false);
    }
  }, [lobbyId, sessionId]);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!lobbyId) return;

    const lobbyChannel = supabase
      .channel(`lobby-${lobbyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_lobbies',
        filter: `id=eq.${lobbyId}`,
      }, (payload) => {
        if (payload.new) {
          setLobby(payload.new as GameLobby);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_players',
        filter: `lobby_id=eq.${lobbyId}`,
      }, async () => {
        const { data } = await supabase
          .from('game_players')
          .select('*')
          .eq('lobby_id', lobbyId)
          .order('turn_order', { ascending: true });
        if (data) {
          setPlayers(data as GamePlayer[]);
          const me = data.find((p: GamePlayer) => p.session_id === sessionId);
          setCurrentPlayer(me || null);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_state',
        filter: `lobby_id=eq.${lobbyId}`,
      }, (payload) => {
        if (payload.new) {
          const newState = payload.new as GameState;
          setGameState({
            ...newState,
            shells: newState.shells as boolean[]
          });
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_messages',
        filter: `lobby_id=eq.${lobbyId}`,
      }, (payload) => {
        if (payload.new) {
          setMessages((prev) => [...prev, payload.new as GameMessage]);
          soundManager.playNewMessage();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(lobbyChannel);
    };
  }, [lobbyId, sessionId]);

  // Subscribe to my items changes
  useEffect(() => {
    if (!currentPlayer) return;

    const itemsChannel = supabase
      .channel(`items-${currentPlayer.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'player_items',
        filter: `player_id=eq.${currentPlayer.id}`,
      }, async () => {
        const { data } = await supabase
          .from('player_items')
          .select('*')
          .eq('player_id', currentPlayer.id)
          .eq('is_used', false);
        if (data) {
          setMyItems(data as PlayerItem[]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(itemsChannel);
    };
  }, [currentPlayer]);

  const startGame = useCallback(async () => {
    if (!lobbyId || !lobby || players.length < 2) return;

    try {
      // Generate shells
      const shells = generateShells(6);

      // Assign turn orders and create items for each player
      for (let i = 0; i < players.length; i++) {
        await supabase
          .from('game_players')
          .update({ turn_order: i })
          .eq('id', players[i].id);

        // Generate random items for this player
        const items = generateRandomItems();
        for (const itemType of items) {
          await supabase.from('player_items').insert({
            player_id: players[i].id,
            item_type: itemType,
          });
        }
      }

      // Create game state
      await supabase.from('game_state').insert({
        lobby_id: lobbyId,
        current_turn_player_id: players[0].id,
        shells: shells,
        current_shell_index: 0,
      });

      // Update lobby status
      await supabase
        .from('game_lobbies')
        .update({ status: 'playing' })
        .eq('id', lobbyId);

      // Add system message
      await addMessage(
        `Game started! ${players.length} players. The shells have been loaded...`,
        'system'
      );

      const loadedCount = shells.filter(s => s).length;
      const emptyCount = shells.filter(s => !s).length;
      await addMessage(
        `Chamber loaded: ${loadedCount} live round${loadedCount > 1 ? 's' : ''}, ${emptyCount} blank${emptyCount > 1 ? 's' : ''}`,
        'system'
      );

      soundManager.playCock();
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game');
    }
  }, [lobbyId, lobby, players]);

  const shoot = useCallback(async (targetPlayerId: string): Promise<ShootResult | null> => {
    if (!gameState || !currentPlayer || !lobby) return null;

    const target = players.find(p => p.id === targetPlayerId);
    if (!target) return null;

    const isSelfShot = targetPlayerId === currentPlayer.id;
    const shells = gameState.shells as boolean[];
    const currentShell = shells[gameState.current_shell_index];
    const isHit = currentShell;

    soundManager.playCock();
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isHit) {
      soundManager.playGunshot();
      soundManager.playHit();
    } else {
      soundManager.playEmptyClick();
    }

    try {
      let newLives = target.lives;
      let isEliminated = false;

      if (isHit) {
        newLives = target.lives - 1;
        isEliminated = newLives <= 0;

        await supabase
          .from('game_players')
          .update({
            lives: newLives,
            is_alive: !isEliminated,
          })
          .eq('id', targetPlayerId);

        if (isEliminated) {
          soundManager.playDeath();
          await addMessage(`${target.player_name} has been eliminated!`, 'action');
        } else {
          await addMessage(`${target.player_name} was hit! ${newLives} lives remaining.`, 'action');
        }
      } else {
        await addMessage(
          isSelfShot
            ? `${currentPlayer.player_name} shot themselves... Click! Empty chamber.`
            : `${currentPlayer.player_name} shot at ${target.player_name}... Click! Empty chamber.`,
          'action'
        );
      }

      // Update shell index
      const nextShellIndex = gameState.current_shell_index + 1;

      // Check if we need to reload
      if (nextShellIndex >= shells.length) {
        const newShells = generateShells(6);
        const loadedCount = newShells.filter(s => s).length;
        const emptyCount = newShells.filter(s => !s).length;
        
        await supabase
          .from('game_state')
          .update({
            shells: newShells,
            current_shell_index: 0,
          })
          .eq('id', gameState.id);

        await addMessage('Chamber reloaded with new shells...', 'system');
        await addMessage(
          `New chamber: ${loadedCount} live round${loadedCount > 1 ? 's' : ''}, ${emptyCount} blank${emptyCount > 1 ? 's' : ''}`,
          'system'
        );
        soundManager.playCock();
      } else {
        await supabase
          .from('game_state')
          .update({ current_shell_index: nextShellIndex })
          .eq('id', gameState.id);
      }

      // Determine next turn
      const alivePlayers = players.filter(p => p.is_alive && (p.id !== targetPlayerId || !isEliminated));

      // Check for winner
      if (alivePlayers.length === 1) {
        await supabase
          .from('game_state')
          .update({ winner_id: alivePlayers[0].id })
          .eq('id', gameState.id);

        await supabase
          .from('game_lobbies')
          .update({ status: 'finished' })
          .eq('id', lobby.id);

        await addMessage(`${alivePlayers[0].player_name} wins the game!`, 'system');
        soundManager.playVictory();

        return {
          hit: isHit,
          targetName: target.player_name,
          shooterName: currentPlayer.player_name,
          isSelfShot,
          livesRemaining: newLives,
          eliminated: isEliminated,
          nextTurnPlayerId: null,
        };
      }

      // Determine next player
      let nextPlayerId: string;

      if (isSelfShot && !isHit) {
        // Self-shot with empty = same player gets another turn
        nextPlayerId = currentPlayer.id;
      } else if (!isSelfShot && isHit) {
        // Shot another player and hit = shooter gets another turn
        nextPlayerId = currentPlayer.id;
      } else {
        // Otherwise, next alive player
        const currentIndex = alivePlayers.findIndex(p => p.id === currentPlayer.id);
        const nextIndex = (currentIndex + 1) % alivePlayers.length;
        nextPlayerId = alivePlayers[nextIndex].id;
      }

      await supabase
        .from('game_state')
        .update({ current_turn_player_id: nextPlayerId })
        .eq('id', gameState.id);

      const nextPlayer = players.find(p => p.id === nextPlayerId);
      if (nextPlayer && nextPlayerId !== currentPlayer.id) {
        await addMessage(`${nextPlayer.player_name}'s turn.`, 'system');
      } else if (nextPlayerId === currentPlayer.id) {
        await addMessage(`${currentPlayer.player_name} gets another turn!`, 'system');
      }

      // Clear revealed shell
      setRevealedShell(null);

      return {
        hit: isHit,
        targetName: target.player_name,
        shooterName: currentPlayer.player_name,
        isSelfShot,
        livesRemaining: newLives,
        eliminated: isEliminated,
        nextTurnPlayerId: nextPlayerId,
      };
    } catch (err) {
      console.error('Error processing shot:', err);
      return null;
    }
  }, [gameState, currentPlayer, players, lobby]);

  const useItem = useCallback(async (item: PlayerItem): Promise<boolean> => {
    if (!currentPlayer || !gameState) return false;

    try {
      soundManager.playItemUse();

      switch (item.item_type) {
        case 'magnifying_glass': {
          const shells = gameState.shells as boolean[];
          const currentShell = shells[gameState.current_shell_index];
          setRevealedShell({ index: gameState.current_shell_index, loaded: currentShell });
          await addMessage(
            `${currentPlayer.player_name} used Magnifying Glass: Current shell is ${currentShell ? 'LOADED' : 'EMPTY'}`,
            'action'
          );
          break;
        }
        case 'phone': {
          const shells = gameState.shells as boolean[];
          const unrevealed = shells
            .map((s, i) => ({ shell: s, index: i }))
            .filter((_, i) => i > gameState.current_shell_index);
          if (unrevealed.length > 0) {
            const random = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            await addMessage(
              `${currentPlayer.player_name} used Phone: Shell #${random.index + 1} is ${random.shell ? 'LOADED' : 'EMPTY'}`,
              'action'
            );
          } else {
            await addMessage(`${currentPlayer.player_name} used Phone: No more shells to reveal.`, 'action');
          }
          break;
        }
        case 'health_potion': {
          const newLives = Math.min(currentPlayer.lives + 1, 5);
          await supabase
            .from('game_players')
            .update({ lives: newLives })
            .eq('id', currentPlayer.id);
          await addMessage(
            `${currentPlayer.player_name} used Health Potion: +1 life (${newLives} total)`,
            'action'
          );
          break;
        }
      }

      // Mark item as used
      await supabase
        .from('player_items')
        .update({ is_used: true })
        .eq('id', item.id);

      return true;
    } catch (err) {
      console.error('Error using item:', err);
      return false;
    }
  }, [currentPlayer, gameState]);

  const addMessage = useCallback(async (message: string, type: 'chat' | 'system' | 'action' = 'chat') => {
    if (!lobbyId) return;

    await supabase.from('game_messages').insert({
      lobby_id: lobbyId,
      player_id: currentPlayer?.id || null,
      message,
      message_type: type,
    });
  }, [lobbyId, currentPlayer]);

  const sendChat = useCallback(async (message: string) => {
    if (!currentPlayer || !message.trim()) return;
    await addMessage(`${currentPlayer.player_name}: ${message}`, 'chat');
  }, [currentPlayer, addMessage]);

  const isMyTurn = currentPlayer && gameState?.current_turn_player_id === currentPlayer.id;
  const isHost = currentPlayer && lobby?.host_id === currentPlayer.session_id;

  return {
    lobby,
    players,
    gameState,
    messages,
    currentPlayer,
    myItems,
    loading,
    error,
    isMyTurn,
    isHost,
    revealedShell,
    startGame,
    shoot,
    useItem,
    sendChat,
    refreshData: fetchGameData,
  };
}
