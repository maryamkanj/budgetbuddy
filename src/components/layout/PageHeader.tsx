import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  icon: Icon,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-8 transition-all pb-2", className)}>
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 drop-shadow-sm font-archivo text-white flex items-center gap-3">
          {title}
          {Icon && <Icon className="h-8 w-8 text-primary opacity-50" />}
        </h1>
        {description && (
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="w-full sm:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}
