'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryWithChildren {
    id: string;
    name: string;
    children?: CategoryWithChildren[];
}

interface NutritionPieChartProps {
    books: { categories: { id: string }[] }[];
    categories: CategoryWithChildren[];
}

const NUTRITION_TARGETS = [
    { name: 'Carbs', match: 'carbohydrate', icon: '🍕', color: '#f59e0b' },
    { name: 'Protein', match: 'protein', icon: '🥩', color: '#ef4444' },
    { name: 'Micronutrients', match: 'micronutrient', icon: '🧂', color: '#10b981' }
];

export default function NutritionPieChart({ books, categories }: NutritionPieChartProps) {
    const data = useMemo(() => {
        const getAllDescendantIds = (category: CategoryWithChildren): string[] => {
            let ids = [category.id];
            if (category.children && category.children.length > 0) {
                category.children.forEach(child => {
                    ids = ids.concat(getAllDescendantIds(child));
                });
            }
            return ids;
        };

        const categoryMap = new Map<string, string[]>();

        NUTRITION_TARGETS.forEach(target => {
            const topCategory = categories.find(c => c.name.toLowerCase().includes(target.match.toLowerCase()));
            if (topCategory) {
                categoryMap.set(target.name, getAllDescendantIds(topCategory));
            } else {
                categoryMap.set(target.name, []);
            }
        });

        const counts = NUTRITION_TARGETS.map(target => {
            const validIds = categoryMap.get(target.name) || [];
            if (validIds.length === 0) return { ...target, value: 0 };

            const count = books.filter(book =>
                book.categories?.some(cat => validIds.includes(cat.id))
            ).length;

            return { ...target, value: count };
        });

        return counts.filter(c => c.value > 0);
    }, [books, categories]);

    if (data.length === 0) return null;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-lg shadow-md border border-stone-200">
                    <p className="font-semibold text-stone-800 flex items-center gap-2">
                        <span>{data.icon}</span> {data.name}
                    </p>
                    <p className="text-stone-600">
                        {data.value} {data.value === 1 ? 'book' : 'books'}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-2xl drop-shadow-md">
                {data[index].icon}
            </text>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mt-8">
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                Nutrition Overview
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="45%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            innerRadius={0}
                            outerRadius="70%"
                            fill="#8884d8"
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                            formatter={(value, entry: any) => (
                                <span className="text-stone-700 font-medium ml-1">
                                    {entry.payload.icon} {value}
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
