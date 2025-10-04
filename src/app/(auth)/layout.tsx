import { AuthLayout } from '@/components/auth/auth-layout';

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}

export const metadata = {
  title: 'BudgetBuddy - Smart Budget Management',
  description: 'Take control of your finances with BudgetBuddy. Track expenses, set budgets, and achieve your financial goals.',
};