'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, PieChart, Target, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';

export default function Header() {
  const { user, setUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    // This will trigger a re-render through the AuthContext
    AuthService.logout();
    setUser(null);
    window.location.href = '/';
  };

  const isActive = (path: string) => pathname === path;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: PieChart },
    { name: 'Transactions', href: '/transactions', icon: DollarSign },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Salary', href: '/salaries', icon: DollarSign },  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">BudgetBuddy</h1>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className={`flex items-center space-x-2 ${
                        isActive(item.href) 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Mobile Menu Button */}
                <button
                  className="md:hidden p-2"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>

                {/* Desktop Logout */}
                <div className="hidden md:block">
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
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
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && mobileMenuOpen && (
          <nav className="md:hidden mt-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`w-full justify-start space-x-2 ${
                      isActive(item.href) 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full justify-start text-gray-700 hover:text-gray-900"
            >
              Logout
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}