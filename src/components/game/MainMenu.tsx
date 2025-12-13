import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { soundManager } from '@/lib/soundManager';

interface MainMenuProps {
  onCreateLobby: (playerName: string) => void;
  onJoinLobby: (partyCode: string, playerName: string) => void;
  onSettings: () => void;
  onCredits: () => void;
  loading: boolean;
  error: string | null;
}

export function MainMenu({ onCreateLobby, onJoinLobby, onSettings, onCredits, loading, error }: MainMenuProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [partyCode, setPartyCode] = useState('');

  const handleMenuClick = (newMode: 'create' | 'join' | 'settings' | 'credits') => {
    soundManager.playUIClick();
    if (newMode === 'settings') {
      onSettings();
    } else if (newMode === 'credits') {
      onCredits();
    } else {
      setMode(newMode);
    }
  };

  const handleBack = () => {
    soundManager.playUIClick();
    setMode('menu');
    setPlayerName('');
    setPartyCode('');
  };

  const handleCreate = () => {
    if (playerName.trim()) {
      onCreateLobby(playerName.trim());
    }
  };

  const handleJoin = () => {
    if (playerName.trim() && partyCode.trim()) {
      onJoinLobby(partyCode.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="game-container flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-cinzel font-bold text-gradient mb-4">
            ROULETTE
          </h1>
          <p className="text-xl text-muted-foreground font-rajdhani tracking-widest">
            A GAME OF FATE
          </p>
          <div className="w-32 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Menu Content */}
        <div className="glass-panel p-8">
          {mode === 'menu' && (
            <div className="space-y-4 animate-scale-in">
              <button
                onClick={() => handleMenuClick('create')}
                className="menu-item w-full text-left"
              >
                Create Game
              </button>
              <button
                onClick={() => handleMenuClick('join')}
                className="menu-item w-full text-left"
              >
                Join Game
              </button>
              <button
                onClick={() => handleMenuClick('settings')}
                className="menu-item w-full text-left"
              >
                Settings
              </button>
              <button
                onClick={() => handleMenuClick('credits')}
                className="menu-item w-full text-left"
              >
                Credits
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-6 animate-scale-in">
              <h2 className="text-2xl font-cinzel text-center text-gradient">Create Game</h2>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground uppercase tracking-wider">
                  Your Name
                </label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name..."
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  maxLength={20}
                />
              </div>

              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreate}
                  className="flex-1 action-button"
                  disabled={loading || !playerName.trim()}
                >
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-6 animate-scale-in">
              <h2 className="text-2xl font-cinzel text-center text-gradient">Join Game</h2>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground uppercase tracking-wider">
                  Your Name
                </label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name..."
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground uppercase tracking-wider">
                  Party Code
                </label>
                <Input
                  value={partyCode}
                  onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground font-mono text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleJoin}
                  className="flex-1 action-button"
                  disabled={loading || !playerName.trim() || partyCode.length !== 6}
                >
                  {loading ? 'Joining...' : 'Join'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          2-4 Players • Strategy • Luck
        </p>
      </div>
    </div>
  );
}
