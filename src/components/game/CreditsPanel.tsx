import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';

interface CreditsPanelProps {
  onBack: () => void;
}

export function CreditsPanel({ onBack }: CreditsPanelProps) {
  return (
    <div className="game-container flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl font-cinzel font-bold text-gradient">
            CREDITS
          </h1>
        </div>

        <div className="glass-panel p-8 text-center space-y-8">
          <div>
            <h2 className="text-2xl font-cinzel text-gradient mb-4">
              ROULETTE
            </h2>
            <p className="text-muted-foreground">
              A Game of Fate
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-accent">Game Design</h3>
              <p className="text-muted-foreground">Inspired by classic Russian Roulette games</p>
            </div>

            <div>
              <h3 className="font-semibold text-accent">Development</h3>
              <p className="text-muted-foreground">Built with React & Lovable Cloud</p>
            </div>

            <div>
              <h3 className="font-semibold text-accent">Art Direction</h3>
              <p className="text-muted-foreground">Dark, moody, psychological thriller aesthetic</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="flex items-center justify-center gap-2 text-muted-foreground">
              Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> for the thrill
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>This is a game. Play responsibly.</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
