import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
}

export default function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
                </div>
                {Icon && (
                    <div className="p-2 bg-blue-50 rounded-full shrink-0">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                )}
            </div>
            {(description || trend) && (
                <div className="mt-4 flex items-center text-sm">
                    {trend && (
                        <span className={`font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'} mr-2`}>
                            {trend.value > 0 ? '+' : ''}{trend.value}%
                        </span>
                    )}
                    {description && <span className="text-gray-500">{description}</span>}
                </div>
            )}
        </div>
    );
}
