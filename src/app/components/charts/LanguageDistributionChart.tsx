'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface LanguageDistributionChartProps {
    data: { name: string; value: number; bookIds?: string[] }[];
    onSegmentClick?: (name: string, bookIds: string[]) => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

export default function LanguageDistributionChart({ data, onSegmentClick }: LanguageDistributionChartProps) {
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
