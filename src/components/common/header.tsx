'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { AuthService } from '@/lib/auth';
import { User } from '@/types/user';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">BudgetBuddy</h1>
          </Link>

          {/* Navigation - Show different buttons based on auth status */}
          <nav className="flex items-center space-x-4">
            {user ? (
              // Show logout button when user is authenticated
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="text-gray-700 hover:text-gray-900"
              >
                Logout
              </Button>
            ) : (
              // Show sign in/sign up when user is not authenticated
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}