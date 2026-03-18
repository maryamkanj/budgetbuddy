import { cn } from "@/lib/utils";

interface FinancialNumberProps {
  amount: number;
  currency?: 'USD' | 'LBP' | string;
  className?: string;
  showSign?: boolean;
}

export function FinancialNumber({ amount, currency = 'USD', className, showSign = false }: FinancialNumberProps) {
  const isPositive = amount > 0;
  const isNegative = amount < 0;

  const formattedAmount = new Intl.NumberFormat(currency === 'LBP' ? 'en-LB' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  return (
    <span
      className={cn(
        "font-mono font-bold transition-colors",
        isPositive ? "text-brand-blue" : "text-foreground",
        className
      )}
    >
      {showSign && isPositive && '+'}
      {showSign && isNegative && '-'}
      {!showSign && isNegative && '-'}
      {formattedAmount}
    </span>
  );
}
