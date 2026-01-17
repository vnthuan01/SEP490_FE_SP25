import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { variantStyles, type Variant } from './type';

export function StatsCard({
  title,
  value,
  trend,
  icon,
  variant = 'default',
  className,
}: {
  title: string;
  value: string;
  trend?: string;
  icon: string;
  variant?: Variant;
  className?: string;
}) {
  const v = variantStyles[variant];

  return (
    <Card
      className={cn('border-border transition-all hover:shadow-md', v.card, v.hover, className)}
    >
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <h3 className={cn('text-4xl font-black mt-2', v.text)}>{value}</h3>
          </div>

          <div className={cn('size-10 rounded-full flex items-center justify-center', v.icon)}>
            <span className="material-symbols-outlined text-lg opacity-80">{icon}</span>
          </div>
        </div>

        {trend && (
          <div
            className={cn(
              'flex items-center gap-2 mt-4 text-xs font-medium px-2 py-1 rounded w-fit',
              v.badge,
            )}
          >
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
