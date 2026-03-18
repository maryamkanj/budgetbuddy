'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Check, X } from 'lucide-react';
import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';

interface AuthFormProps {
  mode: 'login' | 'register';
}

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, loading: authLoading } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const checkPasswordRequirements = (password: string): PasswordRequirements => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  };

  const passwordRequirements = checkPasswordRequirements(formData.password);
  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading || authLoading) return;

    setIsLoading(true);

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (!allRequirementsMet) {
        toast.error('Please meet all password requirements');
        setIsLoading(false);
        return;
      }

      try {
        const result = await signUp(formData.email, formData.password, formData.name);
        if (result.error) {
          toast.error(result.error);
          setIsLoading(false);
          return;
        }
        toast.success('Account created successfully!');
        router.push('/');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An error occurred. Please try again.');
        setIsLoading(false);
      }
    } else {
      try {
        const result = await signIn(formData.email, formData.password);
        if (result.error) {
          toast.error(result.error);
          setIsLoading(false);
          return;
        }
        toast.success('Welcome back!');
        router.push('/');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An error occurred. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const remainingRequirements = [
    { key: 'minLength', label: 'At least 8 characters', met: passwordRequirements.minLength },
    { key: 'hasUppercase', label: '1 uppercase letter (A-Z)', met: passwordRequirements.hasUppercase },
    { key: 'hasLowercase', label: '1 lowercase letter (a-z)', met: passwordRequirements.hasLowercase },
    { key: 'hasNumber', label: '1 number (0-9)', met: passwordRequirements.hasNumber },
    { key: 'hasSpecialChar', label: '1 special character (!@#$%^&*)', met: passwordRequirements.hasSpecialChar },
  ].filter(req => !req.met);

  return (
    <div className="w-full">
      <div className="text-center mb-6 sm:mb-8 px-4 sm:px-6 pt-6 sm:pt-8 flex flex-col items-center">
        <h2 className="text-xl sm:text-2xl font-archivo font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-accent mb-3 sm:mb-4">
          BudgetBuddy
        </h2>
        <h1 className="text-xl sm:text-2xl font-bold font-archivo text-foreground mb-2">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground min-w-0 max-w-72 sm:max-w-sm">
          {mode === 'login'
            ? 'Sign in to continue managing your finances'
            : 'Start managing your capital today'
          }
        </p>
      </div>

      <div className="w-full px-4 sm:px-6 pb-6 sm:pb-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {mode === 'register' && (
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-muted-foreground">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading || authLoading}
                  placeholder="John Doe"
                  className="pl-10 h-10 sm:h-11 bg-transparent border-white/10 focus:border-brand-blue focus:ring-brand-blue text-foreground placeholder:text-muted-foreground/50 [&:-webkit-autofill]:shadow-[0_0_0_1000px_theme(colors.brand-card)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
              </div>
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-muted-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading || authLoading}
                placeholder="you@example.com"
                className="pl-10 h-10 sm:h-11 bg-transparent border-white/10 focus:border-brand-blue focus:ring-brand-blue text-foreground placeholder:text-muted-foreground/50 [&:-webkit-autofill]:shadow-[0_0_0_1000px_theme(colors.brand-card)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
              />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading || authLoading}
                placeholder="••••••••"
                className="pl-10 pr-10 h-10 sm:h-11 bg-transparent border-white/10 focus:border-brand-blue focus:ring-brand-blue text-foreground placeholder:text-muted-foreground/50 [&:-webkit-autofill]:shadow-[0_0_0_1000px_theme(colors.brand-card)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {mode === 'register' && formData.password && (
              <div className="space-y-2 mt-2 sm:mt-3 bg-black/20 p-3 rounded-lg border border-white/5">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Password must contain:</p>
                <div className="space-y-1">
                  {remainingRequirements.map((req) => (
                    <div key={req.key} className="flex items-center gap-2">
                      <X className="h-3 w-3 text-brand-muted shrink-0" />
                      <span className="text-xs text-muted-foreground/80">{req.label}</span>
                    </div>
                  ))}
                  {allRequirementsMet && (
                    <div className="flex items-center gap-2 text-brand-blue">
                      <Check className="h-3 w-3 shrink-0" />
                      <span className="text-xs font-medium">All requirements met!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-muted-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading || authLoading}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-10 sm:h-11 bg-transparent border-white/10 focus:border-brand-blue focus:ring-brand-blue text-foreground placeholder:text-muted-foreground/50 [&:-webkit-autofill]:shadow-[0_0_0_1000px_theme(colors.brand-card)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center gap-2 mt-1 sm:mt-2">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check className="h-3 w-3 text-brand-blue shrink-0" />
                      <span className="text-xs text-brand-blue">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-brand-muted shrink-0" />
                      <span className="text-xs text-brand-muted">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 sm:h-12 bg-gradient-to-r from-brand-blue to-brand-accent hover:brightness-110 shadow-lg shadow-brand-blue/20 text-white font-medium text-sm sm:text-base mt-2"
            disabled={isLoading || authLoading || (mode === 'register' && !allRequirementsMet)}
          >
            {isLoading || authLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" className="border-white" />
                <span className="text-xs sm:text-sm">
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 sm:mt-8 text-center pt-4 sm:pt-6 border-t border-white/10">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <Link
              href={mode === 'login' ? "/register" : "/login"}
              className="font-semibold text-brand-accent hover:text-brand-blue transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}