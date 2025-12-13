import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { soundManager } from '@/lib/soundManager';
import { GameSettings } from '@/lib/gameTypes';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';

interface SettingsPanelProps {
  onBack: () => void;
}

export function SettingsPanel({ onBack }: SettingsPanelProps) {
  const [settings, setSettings] = useState<GameSettings>(soundManager.getSettings());

  useEffect(() => {
    soundManager.updateSettings(settings);
  }, [settings]);

  const handleVolumeChange = (key: keyof GameSettings, value: number[]) => {
    setSettings((prev) => ({ ...prev, [key]: value[0] }));
  };

  const handleMuteToggle = () => {
    setSettings((prev) => ({ ...prev, muted: !prev.muted }));
  };

  const playTestSound = () => {
    soundManager.playUIClick();
  };

  return (
    <div className="game-container flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl font-cinzel font-bold text-gradient">
            SETTINGS
          </h1>
        </div>

        <div className="glass-panel p-8 space-y-8">
          {/* Master Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Master Volume</Label>
              <span className="text-muted-foreground">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.masterVolume]}
              onValueChange={(v) => handleVolumeChange('masterVolume', v)}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          {/* Effects Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Sound Effects</Label>
              <span className="text-muted-foreground">
                {Math.round(settings.effectsVolume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.effectsVolume]}
              onValueChange={(v) => handleVolumeChange('effectsVolume', v)}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Music</Label>
              <span className="text-muted-foreground">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.musicVolume]}
              onValueChange={(v) => handleVolumeChange('musicVolume', v)}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          {/* Mute Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-border">
            <div className="flex items-center gap-3">
              {settings.muted ? (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
              <Label className="text-lg">Mute All</Label>
            </div>
            <Switch
              checked={settings.muted}
              onCheckedChange={handleMuteToggle}
            />
          </div>

          {/* Test Sound */}
          <Button
            variant="outline"
            onClick={playTestSound}
            className="w-full"
          >
            Test Sound
          </Button>
        </div>
      </div>
    </div>
  );
}
