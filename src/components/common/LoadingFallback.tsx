'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { LucideIcon } from 'lucide-react';

interface LoadingFallbackProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

export function LoadingFallback({ title = "Loading...", description = "Please wait a moment.", icon }: LoadingFallbackProps) {
  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <PageContainer>
        <PageHeader title={title} description={description} icon={icon} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-card/40 animate-pulse border border-border" />
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 rounded-xl bg-card/40 animate-pulse border border-border" />
                    <div className="h-64 rounded-xl bg-card/40 animate-pulse border border-border" />
                </div>
                <div className="h-96 rounded-xl bg-card/40 animate-pulse border border-border" />
            </div>
            <div className="space-y-8">
                <div className="h-64 rounded-xl bg-card/40 animate-pulse border border-border" />
                <div className="h-32 rounded-xl bg-card/40 animate-pulse border border-border" />
                <div className="h-32 rounded-xl bg-card/40 animate-pulse border border-border" />
            </div>
        </div>
      </PageContainer>
    </div>
  );
}
