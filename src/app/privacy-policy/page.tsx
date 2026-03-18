'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { LoadingPage } from '@/components/common/LoadingSpinner';

export default function PrivacyPolicyPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center min-h-[60vh]">
        <LoadingPage label="Loading privacy policy..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <PageContainer maxWidth="4xl">
        <PageHeader
          title="Privacy Policy"
          description="Last updated: March 7, 2026"
          icon={Shield}
          action={
            <Link href="/settings">
              <Button 
                variant="ghost" 
                className="hover:bg-secondary flex items-center gap-2 border border-border rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Settings
              </Button>
            </Link>
          }
        />

        <div className="space-y-8">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lock className="h-5 w-5 text-primary" />
                Your Data is Yours
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              At BudgetBuddy, we believe your financial data is private. We do not sell, rent, or share your individual financial information with third parties. Your data is stored securely and used only to provide you with financial insights.
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us when you create an account, such as your name, email address, and financial data (transactions, goals, and salaries).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">2. How We Use Information</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>To provide and maintain the BudgetBuddy service.</li>
              <li>To calculate your financial progress and provide insights.</li>
              <li>To notify you about changes to our service.</li>
              <li>To provide customer support.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3. Data Security</h2>
            <div className="p-4 bg-secondary/50 rounded-lg border border-border flex items-start gap-4">
              <Eye className="h-6 w-6 text-primary shrink-0 mt-1" />
              <p className="text-sm text-muted-foreground">
                We implement industry-standard encryption and security measures (via Supabase) to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. Your Data Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, export, or delete your data at any time through the Settings page. Once you delete your account, all associated data is permanently removed from our active databases.
            </p>
          </section>

          <div className="pt-8 border-t border-border mt-12 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              Questions? Contact us at privacy@budgetbuddy.app
            </p>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
