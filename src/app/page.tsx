import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, PieChart, DollarSign } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Simple Budget Tracking
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-md mx-auto">
          Track spending, set goals, and manage your salary in one place.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Get Started
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-blue-50 rounded-full">
                  <PieChart className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-center text-base">Track Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">
                Log expenses by category with USD/LBP support
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-green-50 rounded-full">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-center text-base">Set Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">
                Create financial goals and track your progress
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-purple-50 rounded-full">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-center text-base">Salary Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">
                Allocate your salary across categories
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-orange-50 rounded-full">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <CardTitle className="text-center text-base">Dual Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">
                Full support for USD and LBP
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-6 md:mb-8">
            How BudgetBuddy Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold text-xs sm:text-sm">1</span>
              </div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Log Transactions</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Record spending and savings by category with optional notes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold text-xs sm:text-sm">2</span>
              </div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Set Your Budget</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Allocate your salary and create financial goals
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold text-xs sm:text-sm">3</span>
              </div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Track Progress</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                View charts and insights to stay on track
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-8 md:py-12 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg sm:text-xl font-bold mb-2">Start Managing Your Money</h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Take control of your finances today.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}