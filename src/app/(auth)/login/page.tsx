import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  return <AuthForm mode="login" />;
}

export const metadata = {
  title: 'Login - BudgetBuddy',
  description: 'Sign in to your BudgetBuddy account to manage your finances and track your budget.',
};