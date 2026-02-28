'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StatusDistributionChartProps {
    data: { name: string; value: number; bookIds?: string[] }[];
    onSegmentClick?: (name: string, bookIds: string[]) => void;
}

// Colors matching the status badge colors roughly
const STATUS_COLORS: Record<string, string> = {
    'To read': '#3b82f6', // blue
    'Studying': '#14b8a6', // teal
    'Reading': '#fbbf24', // amber/yellow
    'Read': '#22c55e',    // green
    'Paused': '#f97316',  // orange
    'Dropped': '#ef4444', // red
    'All': '#6b7280'
};

export default function StatusDistributionChart({ data, onSegmentClick }: StatusDistributionChartProps) {
    if (!data || data.length === 0) {
        return <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>;
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
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
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
