import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getStoredSessionId } from '@/lib/gameUtils';
import { soundManager } from '@/lib/soundManager';

export function useLobby() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = getStoredSessionId();

  const createLobby = useCallback(async (playerName: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // Generate a unique party code
      let partyCode: string;
      let attempts = 0;
      
      do {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        partyCode = '';
        for (let i = 0; i < 6; i++) {
          partyCode += chars[Math.floor(Math.random() * chars.length)];
        }

        const { data: existing } = await supabase
          .from('game_lobbies')
          .select('id')
          .eq('party_code', partyCode)
          .single();

        if (!existing) break;
        attempts++;
      } while (attempts < 10);

      // Create the lobby
      const { data: lobbyData, error: lobbyError } = await supabase
        .from('game_lobbies')
        .insert({
          party_code: partyCode,
          host_id: sessionId,
          status: 'waiting',
          max_players: 4,
        })
        .select()
        .single();

      if (lobbyError) throw lobbyError;

      // Add the host as first player
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          lobby_id: lobbyData.id,
          player_name: playerName,
          session_id: sessionId,
          turn_order: 0,
        });

      if (playerError) throw playerError;

      // Add welcome message
      await supabase.from('game_messages').insert({
        lobby_id: lobbyData.id,
        message: `${playerName} created the lobby. Waiting for players...`,
        message_type: 'system',
      });

      soundManager.playSuccess();
      setLoading(false);
      return lobbyData.id;
    } catch (err) {
      console.error('Error creating lobby:', err);
      setError(err instanceof Error ? err.message : 'Failed to create lobby');
      soundManager.playError();
      setLoading(false);
      return null;
    }
  }, [sessionId]);

  const joinLobby = useCallback(async (partyCode: string, playerName: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // Find the lobby
      const { data: lobbyData, error: lobbyError } = await supabase
        .from('game_lobbies')
        .select('*')
        .eq('party_code', partyCode.toUpperCase())
        .single();

      if (lobbyError || !lobbyData) {
        throw new Error('Lobby not found. Check the party code.');
      }

      if (lobbyData.status !== 'waiting') {
        throw new Error('Game has already started.');
      }

      // Check if already in lobby
      const { data: existingPlayer } = await supabase
        .from('game_players')
        .select('id')
        .eq('lobby_id', lobbyData.id)
        .eq('session_id', sessionId)
        .single();

      if (existingPlayer) {
        setLoading(false);
        return lobbyData.id;
      }

      // Check player count
      const { count } = await supabase
        .from('game_players')
        .select('id', { count: 'exact' })
        .eq('lobby_id', lobbyData.id);

      if (count && count >= lobbyData.max_players) {
        throw new Error('Lobby is full.');
      }

      // Join the lobby
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          lobby_id: lobbyData.id,
          player_name: playerName,
          session_id: sessionId,
          turn_order: count || 0,
        });

      if (playerError) throw playerError;

      // Add join message
      await supabase.from('game_messages').insert({
        lobby_id: lobbyData.id,
        message: `${playerName} joined the game.`,
        message_type: 'system',
      });

      soundManager.playSuccess();
      setLoading(false);
      return lobbyData.id;
    } catch (err) {
      console.error('Error joining lobby:', err);
      setError(err instanceof Error ? err.message : 'Failed to join lobby');
      soundManager.playError();
      setLoading(false);
      return null;
    }
  }, [sessionId]);

  const leaveLobby = useCallback(async (lobbyId: string): Promise<boolean> => {
    try {
      const { data: player } = await supabase
        .from('game_players')
        .select('id, player_name')
        .eq('lobby_id', lobbyId)
        .eq('session_id', sessionId)
        .single();

      if (player) {
        await supabase.from('game_messages').insert({
          lobby_id: lobbyId,
          message: `${player.player_name} left the game.`,
          message_type: 'system',
        });

        await supabase
          .from('game_players')
          .delete()
          .eq('id', player.id);
      }

      return true;
    } catch (err) {
      console.error('Error leaving lobby:', err);
      return false;
    }
  }, [sessionId]);

  return {
    loading,
    error,
    createLobby,
    joinLobby,
    leaveLobby,
  };
}
