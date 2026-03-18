import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

interface TierBadgeProps {
  tier: 'Free' | 'Pro' | 'Business';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function TierBadge({ tier, size = 'md', showIcon = true, className = '' }: TierBadgeProps) {
  const getTierStyles = (tier: string) => {
    switch (tier) {
      case 'Pro':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Business':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-sm px-3 py-2';
      default:
        return 'text-xs px-2 py-1';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Pro':
      case 'Business':
        return <Crown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Badge className={`${getTierStyles(tier)} ${getSizeStyles(size)} border font-medium ${className}`}>
      {showIcon && getTierIcon(tier)}
      <span className={showIcon && getTierIcon(tier) ? 'ml-1' : ''}>
        {tier} Plan
      </span>
    </Badge>
  );
}
