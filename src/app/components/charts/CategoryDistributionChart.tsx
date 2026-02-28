'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryDistributionChartProps {
    data: { name: string; value: number; bookIds?: string[] }[];
    onSegmentClick?: (name: string, bookIds: string[]) => void;
}

// Expanded color palette for categories
const COLORS = [
    '#3b82f6', // blue
    '#ec4899', // pink
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ef4444', // red
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#d946ef', // fuchsia
    '#f97316', // orange
    '#6366f1', // indigo
    '#14b8a6', // teal
];

export default function CategoryDistributionChart({ data, onSegmentClick }: CategoryDistributionChartProps) {
    if (!data || data.length === 0) {
        return <div className="h-[300px] flex items-center justify-center text-gray-400">No category data available</div>;
    }

    const handleClick = (entry: any) => {
        if (onSegmentClick && entry.payload?.bookIds) {
            onSegmentClick(entry.payload.name, entry.payload.bookIds);
        }
    };

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius="50%"
                        outerRadius="70%"
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        onClick={handleClick}
                        className={onSegmentClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#374151' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        layout="horizontal"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
