import React from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon, Info } from 'lucide-react';

export const RiskBadge = ({ level, probability, showIcon = true, size = "md" }) => {
  const normLevel = (level || 'LOW').toUpperCase();

  const styles = {
    LOW: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: CheckCircle,
      label: 'Low Risk'
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      icon: Info,
      label: 'Medium Risk'
    },
    HIGH: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      dot: 'bg-orange-500 animate-pulse',
      icon: AlertTriangle,
      label: 'High Risk'
    },
    CRITICAL: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-300',
      dot: 'bg-rose-600 animate-ping',
      icon: AlertOctagon,
      label: 'Critical Risk'
    }
  };

  const config = styles[normLevel] || styles.LOW;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold',
    lg: 'px-3.5 py-1.5 text-sm font-bold shadow-sm'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${config.bg} ${sizeClasses[size]}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
      {probability !== undefined && (
        <span className="opacity-80 font-mono text-[11px] font-normal ml-0.5">
          ({Math.round(probability * 100)}%)
        </span>
      )}
    </span>
  );
};
