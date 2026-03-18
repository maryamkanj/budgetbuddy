'use client';

import { useEffect, useState } from 'react';
import { useLoadingThreshold } from '@/hooks/useLoadingThreshold';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';
import { AuthForm } from '@/features/auth/components/authForm';
import { LoadingPage } from '@/components/ui/loadingSpinner';

export default function LoginPage() {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const showSkeleton = useLoadingThreshold(loading, 300);

  useEffect(() => {
    setMounted(true);
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (showSkeleton) {
    return <LoadingPage label="Securing session..." />;
  }

  if (!mounted || loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="h-20" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm mode="login" />;
  }
  return null;
}
