'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BooksAddedChartProps {
    data: { month: string; count: number; bookIds?: string[] }[];
    onSegmentClick?: (name: string, bookIds: string[]) => void;
}

export default function BooksAddedChart({ data, onSegmentClick }: BooksAddedChartProps) {
    if (!data || data.length === 0) {
        return <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>;
    }

    const handleDotClick = (_event: any, payload: any) => {
        if (onSegmentClick && payload?.payload?.bookIds?.length > 0) {
            onSegmentClick(`Books Added in ${payload.payload.month}`, payload.payload.bookIds);
        }
    };

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={30}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#374151' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff', className: onSegmentClick ? 'cursor-pointer' : '' }}
                        activeDot={{ r: 7, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff', onClick: handleDotClick, className: onSegmentClick ? 'cursor-pointer' : '' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
