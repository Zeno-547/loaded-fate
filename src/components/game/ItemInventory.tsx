import { PlayerItem } from '@/lib/gameTypes';
import { getItemEmoji, getItemName, getItemDescription } from '@/lib/gameUtils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ItemInventoryProps {
  items: PlayerItem[];
  onUseItem: (item: PlayerItem) => void;
  disabled?: boolean;
}

export function ItemInventory({ items, onUseItem, disabled = false }: ItemInventoryProps) {
  // Group items by type
  const groupedItems = items.reduce((acc, item) => {
    const key = item.item_type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, PlayerItem[]>);

  const itemTypes = Object.keys(groupedItems);

  return (
    <div className="glass-panel p-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Your Items
      </h3>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No items available
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {itemTypes.map((itemType) => {
            const typeItems = groupedItems[itemType];
            const count = typeItems.length;
            const firstItem = typeItems[0];

            return (
              <Tooltip key={itemType}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => !disabled && onUseItem(firstItem)}
                    disabled={disabled}
                    className={cn(
                      'item-slot relative',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className="text-2xl">{getItemEmoji(firstItem.item_type)}</span>
                    {count > 1 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-semibold">{getItemName(firstItem.item_type)}</p>
                  <p className="text-sm text-muted-foreground">
                    {getItemDescription(firstItem.item_type)}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      )}
    </div>
  );
}
