import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: '7xl' | '1920px' | 'full' | '3xl' | '4xl' | '5xl' | '6xl';
}

export function PageContainer({
  children,
  className,
  maxWidth = '1920px'
}: PageContainerProps) {
  const maxWidthClass = {
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    '1920px': 'max-w-ultra',
    'full': 'max-w-full',
  }[maxWidth];

  return (
    <div className={cn(
      "mx-auto px-4 sm:px-8 lg:px-12 pt-20 sm:pt-10 pb-6 sm:pb-10 space-y-8 lg:space-y-12 transition-all",
      maxWidthClass,
      className
    )}>
      {children}
    </div>
  );
}
