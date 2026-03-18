import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, Plus } from 'lucide-react';
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
    if (isAtLimit) return 'bg-destructive';
    if (isNearLimit) return 'bg-accent';
    return 'bg-primary';
  };

  const getBadgeVariant = () => {
    if (isAtLimit) return 'destructive';
    if (isNearLimit) return 'secondary';
    return 'default';
  };

  const getBadgeText = () => {
    if (isAtLimit) return 'Limit Reached';
    if (isNearLimit) return 'Near Limit';
    return 'Normal';
  };

  return (
    <Card className={`border-border shadow-sm ${getSizeStyles(size)} ${className}`}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <Badge variant={getBadgeVariant()} className="text-xs">
            {getBadgeText()}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {current.toLocaleString()} / {limit.toLocaleString()} {unit}
            </span>
            <span className={`font-medium ${isAtLimit ? 'text-destructive font-bold' :
                isNearLimit ? 'text-accent' :
                  'text-foreground'
              }`}>
              {displayPercentage}%
            </span>
          </div>

          <div className="relative">
            <Progress
              value={barPercentage}
              className="h-2"
            />
            <div
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${barPercentage}%` }}
            />
          </div>

          {(isNearLimit || isAtLimit) && (
            <div className={`flex items-start gap-2 text-sm ${isAtLimit ? 'text-destructive font-medium' : 'text-accent'
              }`}>
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                {isAtLimit
                  ? `You've reached your ${unit} limit. Upgrade to continue adding more.`
                  : `You're approaching your ${unit} limit. Consider upgrading soon.`
                }
              </span>
            </div>
          )}

          {showUpgradeButton && (isNearLimit || isAtLimit) && (
            <div className="pt-2">
              <Link href={upgradeLink}>
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
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
