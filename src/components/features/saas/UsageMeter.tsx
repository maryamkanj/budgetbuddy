import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle} from 'lucide-react';
import Link from 'next/link';
import { useSubscription } from '@/providers/SubscriptionProvider';

interface UsageMeterProps {
  title: string;
  current: number;
  limit: number;
  unit: string;
  icon?: React.ReactNode;
  warningThreshold?: number;
  showUpgradeButton?: boolean;
  upgradeLink?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UsageMeter({
  title,
  current,
  limit,
  unit,
  icon,
  warningThreshold = 80,
  showUpgradeButton = false,
  upgradeLink = '/subscription',
  size = 'md',
  className = ''
}: UsageMeterProps) {
  const rawPercentage = (current / limit) * 100;
  const displayPercentage = Math.round(rawPercentage);
  const barPercentage = Math.min(rawPercentage, 100);
  const isNearLimit = rawPercentage >= warningThreshold;
  const isAtLimit = rawPercentage >= 100;

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'sm':
        return 'p-3';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getProgressColor = () => {
    if (isAtLimit) return 'bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.3)]';
    if (isNearLimit) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
    return 'bg-primary shadow-[0_0_10px_rgba(37,99,235,0.3)]';
  };

  const getBadgeVariant = () => {
    if (isAtLimit) return 'destructive';
    if (isNearLimit) return 'outline';
    return 'default';
  };

  const getBadgeText = () => {
    if (isAtLimit) return 'Limit Reached';
    if (isNearLimit) return 'Near Limit';
    return 'Active';
  };

  return (
    <Card className={`border-border shadow-sm rounded-2xl bg-card/60 backdrop-blur-md ${getSizeStyles(size)} ${className}`}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">{title}</h3>
          </div>
          <Badge variant={getBadgeVariant()} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
            {getBadgeText()}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground font-medium">
              {current.toLocaleString()} / {limit.toLocaleString()} {unit}
            </span>
            <span className={`font-black ${isAtLimit ? 'text-destructive' :
                isNearLimit ? 'text-amber-500' :
                  'text-primary'
              }`}>
              {displayPercentage}%
            </span>
          </div>

          <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor()}`}
              style={{ width: `${barPercentage}%` }}
            />
          </div>

          {(isNearLimit || isAtLimit) && (
            <div className={`flex items-start gap-2 text-[11px] leading-tight ${isAtLimit ? 'text-destructive font-bold' : 'text-amber-500 font-medium'
              }`}>
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>
                {isAtLimit
                  ? `Limit reached. Upgrade to unlock more.`
                  : `Approaching limit. Consider upgrading.`
                }
              </span>
            </div>
          )}

          {showUpgradeButton && (isNearLimit || isAtLimit) && (
            <div className="pt-2">
              <Link href={upgradeLink} className="block w-full">
                <Button className="w-full bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl px-4 h-9 text-[11px] font-black uppercase tracking-widest transition-all">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TransactionUsageMeter({ current, showUpgradeButton = true }: {
  current: number;
  showUpgradeButton?: boolean;
}) {
  const { plan } = useSubscription();
  const limit = plan.limits.transactions;

  return (
    <UsageMeter
      title="Monthly Transactions"
      current={current}
      limit={limit}
      unit="transactions"
      icon={<TrendingUp className="h-4 w-4 text-primary" />}
      warningThreshold={80}
      showUpgradeButton={showUpgradeButton && limit !== 999999}
      size="sm"
    />
  );
}

export function GoalUsageMeter({ current, showUpgradeButton = true }: {
  current: number;
  showUpgradeButton?: boolean;
}) {
  const { plan } = useSubscription();
  const limit = plan.limits.goals;

  return (
    <UsageMeter
      title="Active Goals"
      current={current}
      limit={limit}
      unit="goals"
      icon={<TrendingUp className="h-4 w-4 text-primary" />}
      warningThreshold={80}
      showUpgradeButton={showUpgradeButton && limit !== 999999}
      size="sm"
    />
  );
}

export function SalaryUsageMeter({ current, showUpgradeButton = true }: {
  current: number;
  showUpgradeButton?: boolean;
}) {
  const { plan } = useSubscription();
  const limit = plan.limits.salaries;

  return (
    <UsageMeter
      title="Salary Profiles"
      current={current}
      limit={limit}
      unit="salaries"
      icon={<TrendingUp className="h-4 w-4 text-primary" />}
      warningThreshold={100}
      showUpgradeButton={showUpgradeButton && limit !== 999999}
      size="sm"
    />
  );
}
