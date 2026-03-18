'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from '@/components/features/saas/BadgeTier';
import { UsageMeter } from '@/components/features/saas/UsageMeter';
import {
  Crown, Star, Check, TrendingUp, CreditCard, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { useSubscription, useUsageLimits } from '@/providers/SubscriptionProvider';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/config/plans';
import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';

interface Plan {
  id: SubscriptionTier;
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ReactNode;
}

export function SubscriptionClient() {
  const { userProfile, loading: authLoading } = useSupabaseAuth();
  const { tier: currentTier, upgrade, cancel } = useSubscription();
  const usageLimits = useUsageLimits();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const plans: Plan[] = [
    {
      ...SUBSCRIPTION_PLANS.Free,
      price: '$0',
      icon: <Star className="h-6 w-6" />
    },
    {
      ...SUBSCRIPTION_PLANS.Pro,
      price: billingCycle === 'monthly' ? `$${SUBSCRIPTION_PLANS.Pro.price.monthly}` : `$${(SUBSCRIPTION_PLANS.Pro.price.yearly / 12).toFixed(2)}`,
      highlighted: true,
      icon: <Crown className="h-6 w-6" />
    },
    {
      ...SUBSCRIPTION_PLANS.Business,
      price: billingCycle === 'monthly' ? `$${SUBSCRIPTION_PLANS.Business.price.monthly}` : `$${(SUBSCRIPTION_PLANS.Business.price.yearly / 12).toFixed(2)}`,
      icon: <Shield className="h-6 w-6" />
    }
  ];

  if (authLoading) return null;
  if (!userProfile) return null;

  const handleUpgrade = async (planId: 'Pro' | 'Business') => {
    const toastId = toast.loading(`Upgrading to ${planId}...`);
    try {
      await upgrade(planId);
      toast.success(`Successfully upgraded to ${planId} plan!`, { id: toastId });
    } catch {
      toast.error('Failed to upgrade subscription', { id: toastId });
    }
  };

  const confirmCancel = async () => {
    const toastId = toast.loading('Cancelling subscription...');
    try {
      await cancel();
      toast.success('Subscription cancelled.', { id: toastId });
      setShowCancelModal(false);
    } catch {
      toast.error('Failed to cancel subscription', { id: toastId });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-border shadow-sm max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Plan</span>
            <TierBadge tier={currentTier} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-foreground">{currentTier} Plan</h3>
              <p className="text-muted-foreground">
                {currentTier === 'Free' ? 'No subscription active' : 'Monthly billing'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                ${SUBSCRIPTION_PLANS[currentTier].price.monthly}
              </p>
              {currentTier !== 'Free' && <p className="text-sm text-muted-foreground">per month</p>}
            </div>
          </div>

          {currentTier !== 'Free' && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Billing Status</span>
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Active</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-8">
        <UsageMeter
          title="Monthly Transactions"
          current={usageLimits.transactions.current}
          limit={usageLimits.transactions.limit}
          unit="transactions"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          showUpgradeButton={currentTier === 'Free' && usageLimits.transactions.isNearLimit}
        />
        <UsageMeter
          title="Active Goals"
          current={usageLimits.goals.current}
          limit={usageLimits.goals.limit}
          unit="goals"
          icon={<Star className="h-4 w-4 text-primary" />}
          showUpgradeButton={currentTier === 'Free' && usageLimits.goals.isNearLimit}
        />
        <UsageMeter
          title="Salary Profiles"
          current={usageLimits.salaries.current}
          limit={usageLimits.salaries.limit}
          unit="profiles"
          icon={<CreditCard className="h-4 w-4 text-primary" />}
          showUpgradeButton={currentTier === 'Free' && usageLimits.salaries.isNearLimit}
        />
      </div>

      <div className="flex justify-center pt-12">
        <div className="bg-secondary rounded-lg p-1 flex">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingCycle('monthly')}
            className="px-4"
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingCycle('yearly')}
            className="px-4"
          >
            Yearly (Save 17%)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pt-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-border shadow-sm relative ${plan.highlighted ? 'border-primary ring-2 ring-primary/20' : ''}`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                <div className={`p-3 rounded-full ${plan.id === 'Free' ? 'bg-gray-100 text-gray-600' :
                  plan.id === 'Pro' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'}`}>
                  {plan.icon}
                </div>
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <p className="text-muted-foreground">{plan.description}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                {currentTier === plan.id ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${plan.highlighted ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                    onClick={() => plan.id !== 'Free' && handleUpgrade(plan.id as 'Pro' | 'Business')}
                  >
                    {currentTier === 'Free' ? 'Upgrade' : 'Switch'} to {plan.name}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        {currentTier !== 'Free' && (
          <Button variant="outline" onClick={() => setShowCancelModal(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            Cancel Subscription
          </Button>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your subscription? You will lose access to Pro/Business features at the end of your billing cycle."
      />
    </div>
  );
}
