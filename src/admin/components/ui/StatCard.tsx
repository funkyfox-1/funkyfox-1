import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  subtitle,
  className = '',
}: StatCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</span>
        <div className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-700">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-zinc-900">{value}</div>
        <div className="mt-1 flex items-center gap-2">
          {change && (
            <span
              className={`inline-flex items-center text-xs font-medium ${
                trend === 'up'
                  ? 'text-emerald-600'
                  : trend === 'down'
                  ? 'text-rose-600'
                  : 'text-zinc-500'
              }`}
            >
              {trend === 'up' && <TrendingUp size={13} className="mr-0.5" />}
              {trend === 'down' && <TrendingDown size={13} className="mr-0.5" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-xs text-zinc-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
