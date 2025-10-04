import { localStorageService } from './localStorage';
import { User, LoginCredentials, RegisterData } from '@/types/user';

export class AuthService {
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static register(userData: RegisterData): { success: boolean; user?: User; error?: string } {
    // Enhanced validation
    if (!userData.name?.trim()) {
      return { success: false, error: 'Name is required' };
    }

    if (!userData.email?.trim()) {
      return { success: false, error: 'Email is required' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    if (!userData.password) {
      return { success: false, error: 'Password is required' };
    }

    // Enhanced password validation
    const passwordValidation = this.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors[0] };
    }

    if (userData.password !== userData.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    // Check if user already exists
    const existingUser = localStorageService.findUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Create new user
    const newUser = localStorageService.addUser({
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password // In a real app, this would be hashed
    });

    // Initialize user data
    localStorageService.initializeUserData(newUser.id);

    return { success: true, user: newUser };
  }

  static login(credentials: LoginCredentials): { success: boolean; user?: User; error?: string } {
    // Enhanced validation
    if (!credentials.email?.trim()) {
      return { success: false, error: 'Email is required' };
    }

    if (!credentials.password) {
      return { success: false, error: 'Password is required' };
    }

    const user = localStorageService.verifyUser(credentials.email, credentials.password);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    localStorageService.setCurrentUser(user);
    return { success: true, user };
  }

  static logout(): void {
    localStorageService.setCurrentUser(null);
  }

  static getCurrentUser(): User | null {
    return localStorageService.getCurrentUser();
  }

  static isAuthenticated(): boolean {
    return localStorageService.getCurrentUser() !== null;
  }
}