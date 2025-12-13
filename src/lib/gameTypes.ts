export type ItemType = 'magnifying_glass' | 'phone' | 'health_potion';

export interface GameLobby {
  id: string;
  party_code: string;
  host_id: string;
  status: 'waiting' | 'playing' | 'finished';
  max_players: number;
  created_at: string;
  updated_at: string;
}

export interface GamePlayer {
  id: string;
  lobby_id: string;
  player_name: string;
  session_id: string;
  lives: number;
  is_alive: boolean;
  turn_order: number;
  created_at: string;
}

export interface PlayerItem {
  id: string;
  player_id: string;
  item_type: ItemType;
  is_used: boolean;
  created_at: string;
}

export interface GameState {
  id: string;
  lobby_id: string;
  current_turn_player_id: string | null;
  shells: boolean[]; // true = loaded, false = empty
  current_shell_index: number;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameMessage {
  id: string;
  lobby_id: string;
  player_id: string | null;
  message: string;
  message_type: 'chat' | 'system' | 'action';
  created_at: string;
}

export interface ShootResult {
  hit: boolean;
  targetName: string;
  shooterName: string;
  isSelfShot: boolean;
  livesRemaining: number;
  eliminated: boolean;
  nextTurnPlayerId: string | null;
}

export type GameScreen = 'menu' | 'lobby' | 'game' | 'settings' | 'credits';

export interface GameSettings {
  masterVolume: number;
  effectsVolume: number;
  musicVolume: number;
  muted: boolean;
}
