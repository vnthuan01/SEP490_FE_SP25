import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InventoryItem {
  label: string;
  value: number;
  color: string;
}

const ITEMS: InventoryItem[] = [
  { label: 'Nước sạch', value: 85, color: 'bg-primary' },
  { label: 'Lương thực', value: 30, color: 'bg-yellow-500' },
  { label: 'Y tế', value: 15, color: 'bg-red-500' },
  { label: 'Khác', value: 50, color: 'bg-green-500' },
];

export function InventoryStats({ className }: { className?: string }) {
  return (
    <Card className={cn('bg-card border-border h-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">Tồn kho thiết yếu</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {ITEMS.map((item) => (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <div className="space-y-1 cursor-help">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span
                    className={cn(
                      item.label === 'Nước sạch'
                        ? 'text-primary'
                        : item.label === 'Lương thực'
                          ? 'text-yellow-500'
                          : item.label === 'Y tế'
                            ? 'text-red-500'
                            : 'text-blue-500',
                    )}
                  >
                    {item.value}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', item.color)}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {item.label}: {item.value}% còn lại trong kho
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </CardContent>
    </Card>
  );
}
