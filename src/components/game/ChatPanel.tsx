import { useState, useRef, useEffect } from 'react';
import { GameMessage, GamePlayer } from '@/lib/gameTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/gameUtils';

interface ChatPanelProps {
  messages: GameMessage[];
  players: GamePlayer[];
  onSendMessage: (message: string) => void;
}

export function ChatPanel({ messages, players, onSendMessage }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    } else {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return 'System';
    const player = players.find((p) => p.id === playerId);
    return player?.player_name || 'Unknown';
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300',
          'bg-gradient-to-br from-primary to-accent shadow-lg hover:scale-110',
          isOpen && 'scale-0 opacity-0'
        )}
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-4 right-4 z-50 w-80 h-96 glass-panel flex flex-col transition-all duration-300 origin-bottom-right',
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Game Chat
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-secondary rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'chat-bubble',
                msg.message_type === 'system' && 'system',
                msg.message_type === 'action' && 'action'
              )}
            >
              <p className="text-sm break-words">{msg.message}</p>
              <span className="text-xs text-muted-foreground">
                {formatTime(new Date(msg.created_at))}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-input border-border text-sm"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
