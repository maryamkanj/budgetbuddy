'use client';

import { useState, useEffect } from 'react';
import { useLoadingThreshold } from '@/hooks/useLoadingThreshold';
import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';
import { AuthForm } from '@/features/auth/components/authForm';
import { LoadingPage } from '@/components/ui/loadingSpinner';

export default function RegisterPage() {
  const { user, loading } = useSupabaseAuth();
  const [mounted, setMounted] = useState(false);
  const showSkeleton = useLoadingThreshold(loading, 300);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (showSkeleton) {
    return <LoadingPage label="Initializing..." />;
  }

  if (!mounted || loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="h-20" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <AuthForm mode="register" />;
}
