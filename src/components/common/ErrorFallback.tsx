'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import Link from 'next/link';

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  description = "A critical error occurred in the application. We've been notified and are looking into it."
}: ErrorFallbackProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="p-6 bg-destructive/10 rounded-full ring-1 ring-destructive/20 border border-destructive/10 shadow-2xl">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={() => reset()}
            className="rounded-xl px-8 h-12 font-bold flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/">
            <Button
                variant="outline"
                className="rounded-xl px-8 h-12 font-bold flex items-center gap-2"
            >
                <Home className="h-4 w-4" />
                Go Home
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
