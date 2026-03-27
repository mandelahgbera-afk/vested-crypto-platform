import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="rounded-lg bg-background/50 p-3 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Variant for full-page empty states
export function FullPageEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: Omit<EmptyStateProps, 'className'>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6 mb-6">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3 text-center">
        {title}
      </h2>
      <p className="text-base text-muted-foreground text-center max-w-md mb-8">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
