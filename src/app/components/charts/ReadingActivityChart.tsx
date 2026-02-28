'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReadingActivityChartProps {
    data: { year: string; count: number; bookIds?: string[] }[];
    onSegmentClick?: (name: string, bookIds: string[]) => void;
}

export default function ReadingActivityChart({ data, onSegmentClick }: ReadingActivityChartProps) {
    if (!data || data.length === 0) {
        return <div className="h-[300px] flex items-center justify-center text-gray-400">No reading activity recorded yet</div>;
    }

    const handleClick = (entry: any) => {
        if (onSegmentClick && entry.payload?.bookIds) {
            onSegmentClick(`Books Read in ${entry.payload.year}`, entry.payload.bookIds);
        }
    };

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        width={30}
                    />
                    <Tooltip
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                        onClick={handleClick}
                        className={onSegmentClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
