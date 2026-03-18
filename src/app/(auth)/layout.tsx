import { AuthLayout } from '@/components/features/auth/authLayout';
import type { Metadata } from 'next';

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}

export const metadata: Metadata = {
  title: 'BudgetBuddy - Smart Budget Management',
  description: 'Take control of your finances with BudgetBuddy. Track expenses, set budgets, and achieve your financial goals.',
};
