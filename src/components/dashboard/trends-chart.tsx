'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendsChartProps {
  data: { week: string; spending: number; saving: number }[];
  currency: string;
}

export function TrendsChart({ data, currency }: TrendsChartProps) {
  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'LBP' ? 'USD' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center border rounded-lg">
        <p className="text-gray-500">No trend data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis tickFormatter={formatTooltip} />
        <Tooltip formatter={formatTooltip} />
        <Legend />
        <Bar dataKey="spending" name="Spending" fill="#ef4444" />
        <Bar dataKey="saving" name="Saving" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
}