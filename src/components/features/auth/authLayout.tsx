'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, User, Heart, ShoppingBag, Landmark } from 'lucide-react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-gradient-to-l from-primary/10 to-transparent rounded-full blur-[80px] lg:blur-[120px] -mr-48 lg:-mr-96 -mt-48 lg:-mt-96 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-[80px] lg:blur-[120px] -ml-24 lg:-ml-48 -mb-24 lg:-mb-48 pointer-events-none" />

      <div className="w-full lg:w-[55%] relative flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-24 overflow-hidden border-b lg:border-r lg:border-b-0 border-white/10">

        <div className="relative z-20 space-y-8 lg:space-y-12">
          <div className="space-y-4 lg:space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-archivo font-black tracking-tight text-white leading-tight">
              Secure your <br className="hidden sm:block" />
              <span className="text-primary relative inline-block">
                financial path.
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -bottom-2 left-0 h-1 sm:h-1.5 bg-accent/20 rounded-full"
                />
              </span>
            </h1>
            <p className="text-base sm:text-lg xl:text-xl text-muted-foreground font-sans max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Join thousands of people who track their wealth, plan for the future, and stay ahead of their spending with BudgetBuddy.
            </p>
          </div>

          <div className="relative h-[300px] sm:h-[400px] w-full max-w-[500px] mx-auto lg:mx-0 scale-[0.85] sm:scale-100 origin-center lg:origin-left">

            <motion.div
              initial={{ x: -20, y: 20, opacity: 0, rotate: -5 }}
              animate={{ x: 0, y: 0, opacity: 1, rotate: -2 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute top-0 left-0 z-30 w-56 sm:w-72 h-36 sm:h-44 bg-gradient-to-br from-card to-muted rounded-2xl shadow-2xl p-4 sm:p-6 text-white overflow-hidden border border-white/10 group"
            >
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 blur-2xl group-hover:bg-white/10 transition-colors" />
              <div className="flex justify-between items-start mb-auto">
                <Landmark className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                <div className="w-8 sm:w-10 h-6 sm:h-8 bg-gradient-to-r from-amber-200 to-amber-500 rounded-md opacity-80" />
              </div>
              <div className="mt-4 sm:mt-8">
                <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] opacity-40 mb-1">Current Balance</p>
                <p className="text-xl sm:text-2xl font-mono font-bold">$12,450.00</p>
              </div>
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 flex items-center gap-1.5 opacity-60">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-[6px] sm:text-[8px] font-bold tracking-widest uppercase text-white/80">Active Premium Card</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 40, y: -20, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute top-8 sm:top-12 left-32 sm:left-44 z-40 bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-52 sm:w-64 p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-white/5">
                <span className="text-[10px] sm:text-xs font-archivo font-bold text-white uppercase tracking-wider">Recent Activity</span>
                <span className="text-[8px] sm:text-[10px] font-archivo font-medium text-accent">Manage</span>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[10px] font-archivo font-bold text-white">Apple Store</p>
                      <p className="text-[6px] sm:text-[8px] font-sans text-muted-foreground">Yesterday, 4:20 PM</p>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs font-mono font-bold text-white">-$99.00</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[10px] font-archivo font-bold text-white">James Miller</p>
                      <p className="text-[6px] sm:text-[8px] font-sans text-muted-foreground">Yesterday, 1:15 PM</p>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs font-mono font-bold text-primary">+$1,200.00</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute top-36 sm:top-48 left-4 sm:left-8 z-20 bg-primary rounded-2xl shadow-2xl w-40 sm:w-48 h-28 sm:h-32 p-4 sm:p-5 text-white overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 bg-white/10 rounded-full blur-2xl -mr-6 sm:-mr-8 -mt-6 sm:-mt-8" />
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[8px] sm:text-[10px] font-archivo font-bold uppercase tracking-wider">Invested</span>
              </div>
              <p className="text-xl sm:text-2xl font-archivo font-black mb-1">84%</p>
              <div className="h-1 sm:h-1.5 w-full bg-white/20 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-white w-[84%] rounded-full" />
              </div>
              <p className="text-[6px] sm:text-[8px] font-sans opacity-70">New Home Pot</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 sm:top-10 left-[280px] sm:left-[400px] z-50 bg-card/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2"
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-primary" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-archivo font-bold text-white tracking-tight">Active Plan: Pro</span>
            </motion.div>

          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] relative flex items-center justify-center p-6 sm:p-12 lg:min-h-screen z-10 py-16 lg:py-12">
        <div className="w-full max-w-[420px] relative">

          <div className="absolute -inset-4 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full relative z-10"
          >
            <div className="bg-card/60 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
              {children}
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}