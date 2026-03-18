'use client';

import { useState, useEffect } from 'react';
import { useLoadingThreshold } from '@/hooks/useLoadingThreshold';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User as UserIcon,
  Shield,
  Download,
  Trash2,
  Key,
  LogOut,
  Save,
  Eye,
  EyeOff,
  Edit,
  Crown,
  CheckCircle2,
  Award,
  Zap,
  ArrowRight,
  Star
} from 'lucide-react';
import { TierBadge } from '@/features/saas/components/BadgeTier';
import { toast } from 'sonner';
import { useTransactions } from '@/providers/TransactionProvider';
import { useSalaries } from '@/providers/SalaryProvider';
import { useGoals } from '@/providers/GoalProvider';
import { useSubscription, useUsageLimits } from '@/providers/SubscriptionProvider';
import { TransactionUsageMeter, GoalUsageMeter, SalaryUsageMeter } from '@/features/saas/components/UsageMeter';
import { Database } from '@/types/supabase';
import { DeleteConfirmModal } from '@/components/ui/deleteConfirmModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { LoadingPage } from '@/components/ui/loadingSpinner';

type UserProfile = Database['public']['Tables']['users']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

export default function SettingsPage() {
  const { userProfile, signOut, updateProfile, changePassword, deleteAccount } = useSupabaseAuth();
  const { transactions } = useTransactions();
  const { goals } = useGoals();
  const { salaries } = useSalaries();
  const { tier: subscriptionTier, plan: currentPlan } = useSubscription();
  const usageLimits = useUsageLimits();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useLoadingThreshold(loading, 300);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });


  useEffect(() => {
    if (!userProfile) {
      return;
    }
    setUser(userProfile as UserProfile);
    setProfileForm({
      name: userProfile.name || '',
      email: userProfile.email || ''
    });
    setLoading(false);
  }, [userProfile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);

    const toastId = toast.loading('Updating profile...');
    try {
      const { error } = await updateProfile({
        name: profileForm.name,
      });

      if (error) throw new Error(error);

      toast.success('Profile updated successfully', { id: toastId });
      setIsEditingProfile(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      console.error('Failed to update profile:', err);
      toast.error(message, { id: toastId });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.oldPassword) {
      toast.error('Current password is required');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    const toastId = toast.loading('Verifying current password...');

    try {
      const result = await changePassword(passwordForm.oldPassword, passwordForm.newPassword);

      if (result && result.error) {
        toast.error(result.error, { id: toastId });
        setUpdatingPassword(false);
        return;
      }

      toast.success('Password updated successfully', { id: toastId });

      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setUpdatingPassword(false);
      }, 500);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Password change error:', err);
      toast.error(message, { id: toastId });
      setUpdatingPassword(false);
    }
  };


  const handleExportData = () => {
    if (!user || !userProfile) return;

    const esc = (v: string | number | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    let csv = "--- BUDGETBUDDY DATA EXPORT ---\n\n";

    csv += "PROFILE\n";
    csv += "Name,Email,Subscription,Joined Date\n";
    csv += `${esc(userProfile.name)},${esc(userProfile.email)},${esc(userProfile.subscription_tier)},${esc(userProfile.created_at)}\n\n`;
    if (transactions && transactions.length > 0) {
      csv += "TRANSACTIONS\n";
      csv += "Date,Type,Category,Amount,Note\n";
      transactions.forEach((t: Transaction) => {
        csv += `${esc(t.date)},${esc(t.type)},${esc(t.category)},${t.amount},${esc(t.note)}\n`;
      });
      csv += "\n";
    }

    if (goals && goals.length > 0) {
      csv += "FINANCIAL GOALS\n";
      csv += "Title,Target,Current,Status,Deadline\n";
      goals.forEach((g) => {
        const status = g.status || (g.current_amount >= g.target_amount ? "Completed" : "Active");
        csv += `${esc(g.title)},${g.target_amount},${g.current_amount},${status},${esc(g.deadline)}\n`;
      });
      csv += "\n";
    }

    if (salaries && salaries.length > 0) {
      csv += "SALARY RECORDS\n";
      csv += "Nickname,Company,Base Salary,Currency\n";
      salaries.forEach(s => {
        csv += `${esc(s.salary_name)},${esc(s.company_name)},${s.base_salary},${esc(s.currency)}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgetbuddy-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Data exported as CSV successfully');
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    setDeletingAccount(true);
    const toastId = toast.loading('Deleting account...');
    try {
      const { error } = await deleteAccount();
      if (error) throw new Error(error);
      toast.success('Account deleted successfully', { id: toastId });
      router.push('/login');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      console.error('Delete account error:', err);
      toast.error(message, { id: toastId });
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (showSkeleton) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingPage label="Loading settings..." />
      </div>
    );
  }

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageContainer>
        <PageHeader
          title="Settings"
          description="Manage your account, subscription, and preferences"
        />

        <div className="flex flex-col gap-6 lg:gap-8 min-h-[60vh]">
          <div className="flex-1 w-full">
            {activeTab === 'profile' && (
              <Card className="border-white/10 shadow-premium bg-card/50 backdrop-blur-md">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-brand">
                    <UserIcon className="h-5 w-5 text-brand-blue" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <Label htmlFor="name">Name</Label>
                        {!isEditingProfile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingProfile(true)}
                            className="h-7 text-xs text-primary hover:bg-primary/5"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Profile
                          </Button>
                        )}
                      </div>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        readOnly={!isEditingProfile}
                        className={`transition-all duration-200 ${!isEditingProfile ? 'bg-secondary/30 border-transparent cursor-default' : 'border-border'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        readOnly
                        className="border-border opacity-70 bg-secondary"
                      />
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <TierBadge tier={subscriptionTier} />
                      <span className="text-xs sm:text-sm text-muted-foreground">Current subscription plan</span>
                    </div>
                    {isEditingProfile && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          type="submit"
                          disabled={updatingProfile}
                          className="bg-gradient-to-r from-brand-blue to-brand-accent text-white hover:brightness-110 shadow-lg shadow-brand-blue/20"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updatingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileForm({
                              name: userProfile?.name || '',
                              email: userProfile?.email || ''
                            });
                          }}
                          className="border border-white/10 hover:bg-white/5"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <Card className="border-border shadow-sm overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Crown className="h-24 w-24" />
                  </div>
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-2xl flex items-center gap-2">
                          {subscriptionTier === 'Free' ? <Star className="h-6 w-6 text-gray-400" /> :
                            subscriptionTier === 'Pro' ? <Crown className="h-6 w-6 text-primary" /> :
                              <Award className="h-6 w-6 text-orange-500" />}
                          {subscriptionTier} Plan
                        </CardTitle>
                        <p className="text-muted-foreground">{currentPlan.description}</p>
                      </div>
                      <TierBadge tier={subscriptionTier} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 relative">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">
                        {subscriptionTier === 'Free' ? '$0' : subscriptionTier === 'Pro' ? '$9.99' : '$29.99'}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Button onClick={() => router.push('/subscription')} className="w-full bg-primary hover:bg-primary/90">
                        Manage Subscription
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <h3 className="font-brand font-black text-lg flex items-center gap-3">
                      <Zap className="h-5 w-5 text-brand-blue" />
                      Month Usage
                    </h3>
                    <div className="space-y-4">
                      <TransactionUsageMeter current={usageLimits.transactions.current} />
                      <GoalUsageMeter current={usageLimits.goals.current} />
                      <SalaryUsageMeter current={usageLimits.salaries.current} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="font-brand font-black text-lg flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      Plan Benefits
                    </h3>
                    <Card className="border-white/10 shadow-premium bg-white/5">
                      <CardContent className="p-5">
                        <ul className="space-y-4">
                          {currentPlan.features.slice(0, 6).map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span className="text-xs sm:text-sm text-muted-foreground capitalize">
                                {feature.replace(/_/g, ' ')}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {currentPlan.features.length > 6 && (
                          <button
                            onClick={() => router.push('/subscription')}
                            className="mt-5 text-xs text-brand-accent font-bold hover:underline flex items-center gap-1.5"
                          >
                            View all {currentPlan.features.length} features
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <Card className="border-white/10 shadow-premium bg-card/50 backdrop-blur-md">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-brand">
                    <Download className="h-5 w-5 text-brand-blue" />
                    Data & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <p className="font-display font-bold text-foreground mb-1.5">Export Your Data</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-5">
                      Download all your transactions, goals, and profile data in a clear CSV format.
                    </p>
                    <Button
                      onClick={handleExportData}
                      className="w-full bg-brand-blue text-white hover:brightness-110"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data as CSV
                    </Button>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <p className="font-display font-bold text-foreground mb-1.5">Privacy Policy</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-5">
                      Review how we process and protect your financial information.
                    </p>
                    <Link href="/privacy-policy" className="w-full">
                      <Button
                        variant="ghost"
                        className="w-full border border-white/10 hover:bg-white/5"
                      >
                        Read Privacy Policy
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'account' && (
              <Card className="border-white/10 shadow-premium bg-card/50 backdrop-blur-md">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-brand">
                    <Shield className="h-5 w-5 text-brand-muted" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-10">
                  {!isChangingPassword ? (
                    <div className="space-y-4">
                      <p className="font-display font-bold text-foreground">Password Management</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Keep your account secure by updating your password regularly.
                      </p>
                      <Button
                        variant="ghost"
                        onClick={() => setIsChangingPassword(true)}
                        className="w-full flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5"
                      >
                        <Key className="h-4 w-4" />
                        Update Security Password
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <p className="font-display font-bold text-foreground">Change Password</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          className="text-xs h-8 px-3 text-brand-red hover:bg-brand-red/10"
                        >
                          Cancel
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="old-password">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="old-password"
                              type={showOldPassword ? "text" : "password"}
                              placeholder="Current account password"
                              value={passwordForm.oldPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                              className="bg-white/5 border-white/10 pr-10 focus:border-brand-blue"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                              <Input
                                id="new-password"
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Min 6 characters"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="bg-white/5 border-white/10 pr-10 focus:border-brand-blue"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <div className="relative">
                              <Input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Repeat new password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="bg-white/5 border-white/10 pr-10 focus:border-brand-blue"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <Button type="submit" disabled={updatingPassword} className="w-full bg-brand-blue text-white">
                          <Key className="h-4 w-4 mr-2" />
                          {updatingPassword ? 'Updating...' : 'Save New Password'}
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="pt-6 border-t border-white/5">
                    <p className="font-display font-bold text-foreground mb-1.5">Danger Zone</p>
                    <p className="text-xs text-muted-foreground mb-5">Actions here are permanent and cannot be reversed.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button onClick={handleLogout} variant="ghost" className="border border-white/10 hover:bg-white/5">
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </Button>
                      <Button
                        onClick={handleDeleteAccountClick}
                        variant="ghost"
                        disabled={deletingAccount}
                        className="text-brand-red border border-brand-red/20 hover:bg-brand-red/5"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingAccount ? 'Deleting...' : 'Delete Account'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </PageContainer>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed. We're sorry to see you go."
      />
    </div>
  );
}
