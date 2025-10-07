'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthService } from '@/lib/auth';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, TrendingUp, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check password requirements
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
    }

    try {
      let result;
      
      if (mode === 'register') {
        result = AuthService.register(formData);
      } else {
        result = AuthService.login({
          email: formData.email,
          password: formData.password
        });
      }

      if (result.success && result.user) {
        setUser(result.user);
        toast.success(mode === 'register' ? 'Account created successfully!' : 'Welcome back!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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

  // Get remaining requirements (only show unmet requirements)
  const remainingRequirements = [
    { key: 'minLength', label: 'At least 8 characters', met: passwordRequirements.minLength },
    { key: 'hasUppercase', label: '1 uppercase letter (A-Z)', met: passwordRequirements.hasUppercase },
    { key: 'hasLowercase', label: '1 lowercase letter (a-z)', met: passwordRequirements.hasLowercase },
    { key: 'hasNumber', label: '1 number (0-9)', met: passwordRequirements.hasNumber },
    { key: 'hasSpecialChar', label: '1 special character (!@#$%^&*)', met: passwordRequirements.hasSpecialChar },
  ].filter(req => !req.met);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {mode === 'login' ? 'Welcome back' : 'Join BudgetBuddy'}
        </h1>
        <p className="text-gray-600">
          {mode === 'login' 
            ? 'Sign in to continue managing your finances' 
            : 'Create your account to start budgeting'
          }
        </p>
      </div>

      <Card className="w-full border-0 shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    style={{ color: 'black' }}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  style={{ color: 'black' }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  style={{ color: 'black' }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Requirements - Only show unmet requirements */}
              {mode === 'register' && formData.password && (
                <div className="space-y-2 mt-3">
                  <p className="text-sm font-medium text-gray-700">Password must contain:</p>
                  <div className="space-y-1">
                    {remainingRequirements.map((req) => (
                      <div key={req.key} className="flex items-center gap-2">
                        <X className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-gray-600">{req.label}</span>
                      </div>
                    ))}
                    {allRequirementsMet && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-3 w-3" />
                        <span className="text-xs font-medium">All requirements met!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    style={{ color: 'black' }}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading || (mode === 'register' && !allRequirementsMet)}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <a 
                href={mode === 'login' ? "/register" : "/login"} 
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}