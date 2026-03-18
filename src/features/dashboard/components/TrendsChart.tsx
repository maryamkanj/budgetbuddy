'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendsChartProps {
  data: { week: string; spending: number; saving: number }[];
  currency: string;
}

export function TrendsChart({ data, currency }: TrendsChartProps) {
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
        <p className="text-muted-foreground font-sans">No trend data available</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="week"
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatTooltip}
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => {
              return [<span key="val" className="font-mono text-foreground">{formatTooltip(value)}</span>, ""];
            }}
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-sans)'
            }}
            itemStyle={{ color: 'var(--foreground)' }}
            cursor={{ fill: 'var(--secondary)', opacity: 0.2 }}
          />
          <Legend wrapperStyle={{ color: 'var(--foreground)', fontFamily: 'var(--font-sans)' }} />
          <Bar dataKey="spending" name="Spending" fill="var(--color-brand-muted)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="saving" name="Saving" fill="var(--color-brand-blue)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}