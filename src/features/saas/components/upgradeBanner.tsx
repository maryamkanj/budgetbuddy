import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

interface UpgradeBannerProps {
  currentTier: 'Free' | 'Pro' | 'Business';
  targetTier: 'Pro' | 'Business';
  features: string[];
  price?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  compact?: boolean;
}

export function UpgradeBanner({ 
  currentTier, 
  targetTier, 
  features, 
  price, 
  dismissible = false, 
  onDismiss,
  compact = false 
}: UpgradeBannerProps) {
  if (currentTier !== 'Free' && (currentTier === 'Pro' && targetTier === 'Pro')) {
    return null;
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
      <Card className={`border-border shadow-sm bg-gradient-to-r ${getTierColor(targetTier)} text-white`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Upgrade to {targetTier}</h3>
                  <Badge className={getTierBadgeColor(targetTier)}>
                    {price || 'From $9.99/mo'}
                  </Badge>
                </div>
                <p className="text-sm text-white/90 mt-1">
                  Unlock premium features and grow faster
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/subscription">
                <Button variant="secondary" size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                  Upgrade
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              {dismissible && onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="text-white/80 hover:text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-border shadow-sm bg-gradient-to-r ${getTierColor(targetTier)} text-white`}>
      <CardContent className="p-6">
        {dismissible && onDismiss && (
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Crown className="h-6 w-6" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold">Upgrade to {targetTier}</h3>
              <Badge className={getTierBadgeColor(targetTier)}>
                {price || 'From $9.99/mo'}
              </Badge>
            </div>
            
            <p className="text-white/90 mb-4">
              Take your budget management to the next level with advanced features designed for serious users.
            </p>
            
            <div className="space-y-2 mb-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-300 fill-current" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <Link href="/subscription">
                <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
                  Upgrade Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
