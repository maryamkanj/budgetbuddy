import { AuthForm } from '@/components/auth/auth-form';

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}

export const metadata = {
  title: 'Sign Up - BudgetBuddy',
  description: 'Create your BudgetBuddy account to start managing your finances and tracking your budget effectively.',
};