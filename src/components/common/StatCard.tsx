import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: React.ReactNode;
    isPositive?: boolean;
    label?: string;
  };
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
  className
}: StatCardProps) {
  return (
    <Card className={cn(
      "border border-white/5 shadow-sm bg-card/60 backdrop-blur-xl transition-all duration-300 hover:translate-y-[-2px] hover:bg-card/80 hover:border-white/10 group rounded-2xl",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-xl backdrop-blur-md", iconBgColor)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </div>
          {trend && (
            <span className={cn(
              "text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.isPositive !== undefined
                ? (trend.isPositive ? 'bg-brand-success/10 text-brand-success' : 'bg-destructive/10 text-destructive')
                : 'bg-muted/10 text-muted-foreground'
            )}>
              {trend.value}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-1 font-medium uppercase">
            {description}
          </p>
        )}
        {trend?.label && !description && (
          <p className="text-[11px] text-muted-foreground mt-1 font-medium uppercase">
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
