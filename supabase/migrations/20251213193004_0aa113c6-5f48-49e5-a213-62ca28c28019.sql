-- Game Lobbies table
CREATE TABLE public.game_lobbies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    party_code TEXT NOT NULL UNIQUE,
    host_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
    max_players INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Players in lobbies
CREATE TABLE public.game_players (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID NOT NULL REFERENCES public.game_lobbies(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    session_id TEXT NOT NULL,
    lives INTEGER NOT NULL DEFAULT 5,
    is_alive BOOLEAN NOT NULL DEFAULT true,
    turn_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Player items
CREATE TABLE public.player_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('magnifying_glass', 'phone', 'health_potion')),
    is_used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Game state
CREATE TABLE public.game_state (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID NOT NULL REFERENCES public.game_lobbies(id) ON DELETE CASCADE UNIQUE,
    current_turn_player_id UUID REFERENCES public.game_players(id) ON DELETE SET NULL,
    shells JSONB NOT NULL DEFAULT '[]',
    current_shell_index INTEGER NOT NULL DEFAULT 0,
    winner_id UUID REFERENCES public.game_players(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages
CREATE TABLE public.game_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID NOT NULL REFERENCES public.game_lobbies(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.game_players(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'action')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_messages ENABLE ROW LEVEL SECURITY;

-- Public access policies (game doesn't require auth for simplicity)
CREATE POLICY "Anyone can view lobbies" ON public.game_lobbies FOR SELECT USING (true);
CREATE POLICY "Anyone can create lobbies" ON public.game_lobbies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lobbies" ON public.game_lobbies FOR UPDATE USING (true);

CREATE POLICY "Anyone can view players" ON public.game_players FOR SELECT USING (true);
CREATE POLICY "Anyone can join as player" ON public.game_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.game_players FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete players" ON public.game_players FOR DELETE USING (true);

CREATE POLICY "Anyone can view items" ON public.player_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create items" ON public.player_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update items" ON public.player_items FOR UPDATE USING (true);

CREATE POLICY "Anyone can view game state" ON public.game_state FOR SELECT USING (true);
CREATE POLICY "Anyone can create game state" ON public.game_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update game state" ON public.game_state FOR UPDATE USING (true);

CREATE POLICY "Anyone can view messages" ON public.game_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can create messages" ON public.game_messages FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_lobbies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_messages;

-- Function to generate party code
CREATE OR REPLACE FUNCTION generate_party_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;