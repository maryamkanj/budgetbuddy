'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryChartProps {
  data: { category: string; amount: number; percentage: number }[];
  currency: string;
}

const COLORS = [
  'var(--color-brand-blue)',
  'var(--color-brand-accent)',
  'var(--color-chart-3)',
  'var(--color-brand-muted)',
  'var(--color-chart-5)',
  'var(--color-secondary)'
];

export function CategoryChart({ data, currency }: CategoryChartProps) {
  const chartData = data.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage
  }));

  const formatTooltip = (value: number) => {
    const validCurrency = currency || 'USD';
    return new Intl.NumberFormat(validCurrency === 'LBP' ? 'en-LB' : 'en-US', {
      style: 'currency',
      currency: validCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };


  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center border border-border rounded-lg bg-secondary/20">
        <p className="text-muted-foreground font-sans">No spending data available</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props) => {
              if (typeof window !== 'undefined' && window.innerWidth < 640) return null;
              const { name, percentage } = props as unknown as { name: string; percentage: number };
              return `${name} (${percentage?.toFixed(1)}%)`;
            }}
            outerRadius={80}
            fill="var(--color-primary)"
            dataKey="value"
            stroke="rgba(255,255,255,0.05)"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => {
              return [<span key="amount" className="font-mono text-foreground">{formatTooltip(value)}</span>, "Amount"];
            }}
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-sans)'
            }}
            itemStyle={{ color: 'var(--foreground)' }}
          />
          <Legend wrapperStyle={{ color: 'var(--foreground)', fontFamily: 'var(--font-sans)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}