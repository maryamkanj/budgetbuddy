'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/features/saas/BadgeTier';
import {
  Menu,
  X,
  Home,
  CreditCard,
  PiggyBank,
  Settings,
  LogOut,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  Download
} from 'lucide-react';
import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';
import { useSubscription } from '@/providers/SubscriptionProvider';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Goals', href: '/goals', icon: PiggyBank },
  { name: 'Salaries', href: '/salaries', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: FileText },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    subItems: [
      { name: 'Profile', href: '/settings?tab=profile', icon: User },
      { name: 'Subscription', href: '/settings?tab=subscription', icon: CreditCard },
      { name: 'Data & Privacy', href: '/settings?tab=data', icon: Download },
      { name: 'Account', href: '/settings?tab=account', icon: Shield },
    ]
  },
];

export default function Sidebar() {
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [settingsExpanded, setSettingsExpanded] = React.useState(true);
  const { tier } = useSubscription();
  const { userProfile, signOut } = useSupabaseAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/settings') return pathname === '/settings';
    if (path.includes('?tab=')) {
      const [baseUrl, query] = path.split('?');
      const tab = new URLSearchParams(query).get('tab');
      return pathname === baseUrl && searchParams.get('tab') === tab;
    }
    return pathname === path;
  };

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-mobile-nav">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Menu Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:flex lg:flex-col lg:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        <div className="flex flex-col h-full">

          <div className="flex justify-center pt-2 pb-1 border-b border-border">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="BudgetBuddy"
                width={400}
                height={150}
                priority
                className="h-32 w-auto object-contain brightness-200"
              />
            </Link>
          </div>

          <div className="px-4 py-2 border-b border-border">
            {mounted && userProfile ? (
              <div className="space-y-1">

                <div className="flex items-center space-x-3">

                  <div className="w-9 h-9 bg-card border border-border rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-foreground">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {userProfile.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userProfile.email}
                    </p>
                  </div>

                </div>

                <div className="flex items-center justify-between pt-1">
                  <TierBadge tier={tier} size="sm" />
                </div>

              </div>
            ) : (
              <Link href="/login">
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </div>

          <nav className="flex-1 px-3 py-3 space-y-1 no-scrollbar overflow-y-auto">
            {navigation.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isItemActive = isActive(item.href) || (hasSubItems && pathname.startsWith(item.href));

              return (
                <div key={item.name} className="space-y-1">
                  {hasSubItems ? (
                    <button
                      onClick={() => setSettingsExpanded(!settingsExpanded)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all
                        ${isItemActive && !settingsExpanded
                          ? 'bg-accent/10 text-primary border-l-2 border-primary'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <item.icon className={`mr-3 h-5 w-5 ${isItemActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        {item.name}
                      </div>
                      {settingsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all
                        ${isActive(item.href)
                          ? 'bg-accent/10 text-primary border-l-2 border-primary shadow-nav-active'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                        }
                      `}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}`} />
                      {item.name}
                    </Link>
                  )}

                  {hasSubItems && settingsExpanded && (
                    <div className="pl-4 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all
                            ${isActive(subItem.href)
                              ? 'bg-accent/5 text-accent'
                              : 'text-muted-foreground/70 hover:bg-white/5 hover:text-foreground'
                            }
                          `}
                        >
                          <subItem.icon className={`mr-2.5 h-3.5 w-3.5 ${isActive(subItem.href) ? 'text-accent' : 'text-muted-foreground/50'}`} />
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {mounted && userProfile && (
            <div className="p-3 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-white/5"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          )}

        </div>
      </div>

    </>
  );
}