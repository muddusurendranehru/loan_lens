'use client';

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'green' | 'yellow' | 'purple';
  onClick?: () => void;
}

export default function MetricCard({ title, value, icon, color, onClick }: MetricCardProps) {
  const colorClasses = {
    green: 'bg-gradient-to-br from-green-500 to-green-600',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  };

  return (
    <div
      onClick={onClick}
      className={`${colorClasses[color]} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
        onClick ? 'hover:scale-105' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        <span className="text-sm opacity-90">{title}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

