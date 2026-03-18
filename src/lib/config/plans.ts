export type SubscriptionTier = 'Free' | 'Pro' | 'Business';

export interface SubscriptionLimits {
  transactions: number;
  goals: number;
  salaries: number;
  teamMembers: number;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: { monthly: number; yearly: number };
  limits: SubscriptionLimits;
  features: string[];
  description: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  Free: {
    id: 'Free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    limits: {
      transactions: 200,
      goals: 10,
      salaries: 2,
      teamMembers: 1
    },
    features: [
      '200 transactions per month',
      '10 active goals',
      '2 salary profiles',
      'Basic analytics',
      'Email support'
    ],
    description: 'Perfect for getting started'
  },
  Pro: {
    id: 'Pro',
    name: 'Pro',
    price: { monthly: 9.99, yearly: 99.99 },
    limits: {
      transactions: 999999,
      goals: 999999,
      salaries: 5,
      teamMembers: 1
    },
    features: [
      'Unlimited transactions',
      'Unlimited goals',
      '5 salary profiles',
      'Advanced analytics & reports',
      'Data export (CSV, PDF)',
      'Priority email support',
      'Ad-free experience'
    ],
    description: 'For serious budget planners'
  },
  Business: {
    id: 'Business',
    name: 'Business',
    price: { monthly: 29.99, yearly: 299.99 },
    limits: {
      transactions: 999999,
      goals: 999999,
      salaries: 999999,
      teamMembers: 5
    },
    features: [
      'Everything in Pro',
      'Unlimited salary profiles',
      'Team collaboration (5 users)',
      'Advanced reporting',
      'API access',
      'Custom integrations',
      'Phone support',
      'SLA guarantee'
    ],
    description: 'For teams and power users'
  }
};

export const PLAN_LIMITS = Object.entries(SUBSCRIPTION_PLANS).reduce((acc, [key, plan]) => {
  acc[key as SubscriptionTier] = plan.limits;
  return acc;
}, {} as Record<SubscriptionTier, SubscriptionLimits>);
