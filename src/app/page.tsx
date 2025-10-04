import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, PieChart, DollarSign, Shield, Smartphone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Take Control of Your
          <span className="text-blue-600"> Finances</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          BudgetBuddy helps you track spending, set goals, and build better financial habits with intuitive tools and gamified achievements.
        </p>
        
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Master Your Money
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PieChart className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Smart Tracking</CardTitle>
              </div>
              <CardDescription>
                Track spending and savings across categories with intuitive charts and insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Goal Setting</CardTitle>
              </div>
              <CardDescription>
                Set financial goals and track your progress with visual progress bars and deadlines.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Salary Planning</CardTitle>
              </div>
              <CardDescription>
                Allocate your salary across categories and stay within your budget limits.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Dual Currency</CardTitle>
              </div>
              <CardDescription>
                Support for both USD and LBP currencies to match your financial reality.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Local & Secure</CardTitle>
              </div>
              <CardDescription>
                Your data stays on your device. No cloud storage, complete privacy.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Mobile First</CardTitle>
              </div>
              <CardDescription>
                Responsive design that works perfectly on all your devices.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto bg-blue-600 text-white">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Finances?</h3>
            <p className="mb-6 opacity-90">
              Join thousands of users who have taken control of their financial future with BudgetBuddy.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Your Journey Today
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}