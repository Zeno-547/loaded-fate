import { ItemType } from './gameTypes';

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function getStoredSessionId(): string {
  let sessionId = localStorage.getItem('roulette_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('roulette_session_id', sessionId);
  }
  return sessionId;
}

export function generateShells(count: number = 6): boolean[] {
  const shells: boolean[] = [];
  const loadedCount = Math.floor(Math.random() * 3) + 1; // 1-3 loaded shells
  
  for (let i = 0; i < count; i++) {
    shells.push(i < loadedCount);
  }
  
  // Shuffle the shells
  for (let i = shells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shells[i], shells[j]] = [shells[j], shells[i]];
  }
  
  return shells;
}

export function generateRandomItems(): ItemType[] {
  const items: ItemType[] = [];
  const itemTypes: ItemType[] = ['magnifying_glass', 'phone', 'health_potion'];
  
  // Random number of items (1-4)
  const itemCount = Math.floor(Math.random() * 4) + 1;
  
  for (let i = 0; i < itemCount; i++) {
    const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    items.push(randomItem);
  }
  
  return items;
}

export function getItemName(itemType: ItemType): string {
  switch (itemType) {
    case 'magnifying_glass':
      return 'Magnifying Glass';
    case 'phone':
      return 'Phone';
    case 'health_potion':
      return 'Health Potion';
    default:
      return 'Unknown Item';
  }
}

export function getItemDescription(itemType: ItemType): string {
  switch (itemType) {
    case 'magnifying_glass':
      return 'Reveals if the current shell is loaded or empty';
    case 'phone':
      return 'Reveals a random shell position in the chamber';
    case 'health_potion':
      return 'Restores 1 life point';
    default:
      return '';
  }
}

export function getItemEmoji(itemType: ItemType): string {
  switch (itemType) {
    case 'magnifying_glass':
      return '🔍';
    case 'phone':
      return '📱';
    case 'health_potion':
      return '🧪';
    default:
      return '❓';
  }
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
