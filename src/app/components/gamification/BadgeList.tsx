'use client';

import { BADGES } from '@/lib/gamification';
import { Lock } from 'lucide-react';

interface BadgeListProps {
    stats: any; // Using the stats object from getLibraryStats
}

export default function BadgeList({ stats }: BadgeListProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {BADGES.map(badge => {
                const isUnlocked = badge.condition(stats);

                return (
                    <div
                        key={badge.id}
                        className={`
                            relative p-4 rounded-xl border flex flex-col items-center text-center transition-all
                            ${isUnlocked
                                ? 'bg-white border-yellow-200 shadow-sm'
                                : 'bg-gray-50 border-gray-200 opacity-60 grayscale'
                            }
                        `}
                    >
                        <div className="text-4xl mb-2 filter drop-shadow-sm">
                            {badge.icon}
                        </div>
                        <h3 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                            {badge.name}
                        </h3>
                        <p className="text-xs text-gray-500 leading-tight">
                            {badge.description}
                        </p>

                        {!isUnlocked && (
                            <div className="absolute top-2 right-2 text-gray-400">
                                <Lock className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
