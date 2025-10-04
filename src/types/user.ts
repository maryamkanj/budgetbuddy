export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }