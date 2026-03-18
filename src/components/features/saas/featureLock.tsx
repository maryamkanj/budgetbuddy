import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, ArrowRight, PieChart, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface FeatureLockProps {
  title: string;
  description: string;
  requiredTier: 'Pro' | 'Business';
  currentTier: 'Free' | 'Pro' | 'Business';
  features?: string[];
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function FeatureLock({
  title,
  description,
  requiredTier,
  currentTier,
  features = [],
  compact = false,
  children
}: FeatureLockProps) {

  if (currentTier !== 'Free' && (currentTier === requiredTier || currentTier === 'Business')) {
    return <>{children}</>;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Pro':
        return 'from-purple-600 to-indigo-600';
      case 'Business':
        return 'from-orange-600 to-red-600';
      default:
        return 'from-primary to-primary/80';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Pro':
        return 'bg-purple-100 text-purple-800';
      case 'Business':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  if (compact) {
    return (
      <Card className={`border-border shadow-sm bg-gradient-to-r ${getTierColor(requiredTier)} text-white`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <Badge className={`text-xs ${getTierBadgeColor(requiredTier)}`}>
                    {requiredTier}
                  </Badge>
                </div>
                <p className="text-xs text-white/80 mt-1">{description}</p>
              </div>
            </div>
            <Link href="/subscription">
              <Button variant="secondary" size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                Upgrade
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="blur-sm opacity-50 pointer-events-none">
        {children}
      </div>

      <Card className={`absolute inset-0 border-border shadow-sm bg-gradient-to-r ${getTierColor(requiredTier)} text-white flex items-center justify-center`}>
        <CardContent className="p-6 text-center">
          <div className="p-3 bg-white/20 rounded-lg inline-flex mb-4">
            <Lock className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-white/90 mb-4">{description}</p>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className={getTierBadgeColor(requiredTier)}>
              <Crown className="h-3 w-3 mr-1" />
              {requiredTier} Feature
            </Badge>
          </div>

          {features.length > 0 && (
            <div className="space-y-2 mb-6">
              <p className="text-sm font-semibold text-white/90">Unlock with {requiredTier}:</p>
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-center gap-2 text-sm text-white/80">
                  <Star className="h-4 w-4 text-yellow-300 fill-current" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link href="/subscription">
              <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
                Upgrade to {requiredTier}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdvancedAnalyticsLock({ currentTier }: { currentTier: 'Free' | 'Pro' | 'Business' }) {
  if (currentTier !== 'Free') {
    return null;
  }

  return (
    <FeatureLock
      title="Advanced Analytics"
      description="Get detailed insights and trends about your spending habits"
      requiredTier="Pro"
      currentTier={currentTier}
      features={[
        'Spending trends analysis',
        'Category breakdowns',
        'Monthly reports',
        'Export to CSV/PDF'
      ]}
      compact
    >
      <div>
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Advanced analytics chart</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Weekly trends chart</p>
          </CardContent>
        </Card>
      </div>
    </FeatureLock>
  );
}

export function MultipleSalariesLock({ currentTier }: { currentTier: 'Free' | 'Pro' | 'Business' }) {
  return (
    <FeatureLock
      title="Multiple Salary Profiles"
      description="Manage multiple income streams and salary profiles"
      requiredTier="Business"
      currentTier={currentTier}
      features={[
        'Unlimited salary profiles',
        'Income stream tracking',
        'Combined budget planning',
        'Advanced allocation rules'
      ]}
      compact
    />
  );
}

export function ExportDataLock({ currentTier }: { currentTier: 'Free' | 'Pro' | 'Business' }) {
  return (
    <FeatureLock
      title="Data Export"
      description="Export your financial data in various formats"
      requiredTier="Pro"
      currentTier={currentTier}
      features={[
        'CSV export',
        'PDF reports',
        'Excel compatibility',
        'Custom date ranges'
      ]}
      compact
    />
  );
}

export function TeamCollaborationLock({ currentTier }: { currentTier: 'Free' | 'Pro' | 'Business' }) {
  return (
    <FeatureLock
      title="Team Collaboration"
      description="Share budgets and collaborate with family members or team"
      requiredTier="Business"
      currentTier={currentTier}
      features={[
        'Multiple users',
        'Role-based permissions',
        'Shared budgets',
        'Collaborative goals'
      ]}
      compact
    />
  );
}
