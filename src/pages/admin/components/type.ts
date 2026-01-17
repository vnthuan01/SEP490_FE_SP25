export type Variant = 'default' | 'primary' | 'success' | 'warning' | 'info';

export const variantStyles: Record<
  Variant,
  {
    card: string;
    icon: string;
    text: string;
    badge: string;
    hover: string;
  }
> = {
  default: {
    card: 'bg-card',
    icon: 'bg-muted text-muted-foreground',
    text: 'text-foreground',
    badge: 'bg-muted text-muted-foreground',
    hover: 'hover:bg-muted/40',
  },
  primary: {
    card: 'bg-primary/15 dark:bg-primary/10',
    icon: 'bg-primary/20 text-primary',
    text: 'text-primary',
    badge: 'bg-primary/20 text-primary',
    hover: 'hover:bg-primary/25 dark:hover:bg-primary/20',
  },
  success: {
    card: 'bg-emerald-500/15 dark:bg-emerald-500/10',
    icon: 'bg-emerald-500/20 text-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    hover: 'hover:bg-emerald-500/25 dark:hover:bg-emerald-500/20',
  },
  warning: {
    card: 'bg-orange-500/15 dark:bg-orange-500/10',
    icon: 'bg-orange-500/20 text-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    hover: 'hover:bg-orange-500/25 dark:hover:bg-orange-500/20',
  },
  info: {
    card: 'bg-blue-500/15 dark:bg-blue-500/10',
    icon: 'bg-blue-500/20 text-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    hover: 'hover:bg-blue-500/25 dark:hover:bg-blue-500/20',
  },
};
