# 💰 BudgetBuddy — Advanced Personal Finance Management

**Live Demo: [budgetbuddy-zeta.vercel.app](https://budgetbuddy-zeta.vercel.app)**

BudgetBuddy is a premium, feature-rich personal finance application built with a modern tech stack. It empowers users to track spending, manage multiple income sources, set financial goals, and generate detailed reports with ease. Designed for a seamless and responsive experience, it offers real-time data persistence and a sleek, animated UI.

---

## ✨ Features

### 📊 **Intelligent Dashboard**
- **Financial Overview**: Instant summary of total savings, total spending, and net balance.
- **Spending Trends**: Visual bar charts (Weekly/Monthly) powered by **Recharts**.
- **Category Breakdown**: Interactive pie charts for spending distribution analysis.
- **Top Categories**: Quick view of your most frequent spending areas.

### 💸 **Comprehensive Transaction Management**
- **Granular Logging**: Categorize every transaction (Food, Transport, Bills, etc.).
- **Custom Categories**: Create and manage unique categories that fit your lifestyle.
- **Optimistic UI**: Experience zero-latency updates with immediate feedback on additions or deletions.
- **Dynamic Search & Filtering**: Quickly find transactions by category or amount.

### 💼 **Advanced Salary & Allocation Tracking**
- **Multi-Salary Support**: Manage multiple income streams independently.
- **Percentage-Based Allocation**: Strategically distribute your salary across categories.
- **Visual Distributions**: Track how much of each salary is allocated vs. unallocated with intuitive cards.
- **Automated Budgeting**: See how your real spending compares to your planned allocations.

### 🎯 **Financial Goals & Motivation**
- **Target Tracking**: Set long-term financial targets and monitor progress in real-time.
- **Visual Progress**: Dynamic progress bars showing current savings vs. the goal amount.
- **Confetti Completion**: Celebrate your financial milestones with delightful animations upon goal completion.
- **Historical Analysis**: Keep track of achieved, failed, and active goals.

### 📝 **Export & Reporting**
- **Custom Reports**: Generate detailed summaries for specific periods.
- **PDF Export**: Generate professional PDF reports with one click using **jsPDF** and **Autotable**.
- **Data Visualization**: Rich, responsive charts to identify spending patterns.

### 🛡️ **SaaS Capabilities & User Plans**
- **Usage Enforcement**: Built-in limits for Free vs. Pro plans (e.g., 200 transactions/month, 10 active goals).
- **Pro Tiers**: Managed via a dedicated `SubscriptionProvider` with feature-locking capabilities.
- **Secure Authentication**: Robust session management and protected routes using **Supabase SSR**.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode for safety)
- **Database / Auth**: [Supabase](https://supabase.com/) (SSR, Postgres, Session persistence)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) + [Autotable](https://github.com/simonbengtsson/jspdf-autotable)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- A Supabase Project (URL and Anon/Service Keys)

### Installation
1.  **Clone the Repository**
    ```bash
    git clone https://github.com/maryamkanj/budgetbuddy.git
    cd budgetbuddy
    ```
2.  **Install Dependencies**
    ```bash
    npm install
    ```
3.  **Environment Setup**
    Create a `.env.local` file (or copy from `.env.example`) and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    NEXT_PUBLIC_APP_NAME=BudgetBuddy
    ```
4.  **Database Setup**
    - Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
    - Select your project and navigate to the **SQL Editor**.
    - Create a **New Query**.
    - Open the `supabase/sql/schema.sql` file in this repository.
    - Copy the entire content of the file and paste it into the Supabase SQL Editor.
    - Click **Run** to generate the necessary tables, types, and security policies.

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
6.  **Access the Application**
    Visit `http://localhost:3000` to start managing your budget.

## 📝 License
This project is licensed under the MIT License.
