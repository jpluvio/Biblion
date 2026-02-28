'use client';

import { calculateLevel } from '@/lib/gamification';
import { Trophy, Star } from 'lucide-react';

interface UserProgressProps {
    xp: number;
    userName: string | null;
}

export default function UserProgress({ xp, userName }: UserProgressProps) {
    const { level, progress, nextLevelXp } = calculateLevel(xp);

    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                        <Trophy className="w-8 h-8 text-yellow-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{userName}&apos;s Reading Journey</h2>
                        <p className="text-white/80 text-sm">Level {level} Reader</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-bold block">{xp}</span>
                    <span className="text-xs uppercase tracking-wider opacity-80">Total XP</span>
                </div>
            </div>

            <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-white/20">
                        Progress to Level {level + 1}
                    </div>
                    <div className="text-xs font-semibold inline-block text-white/80">
                        {Math.floor(progress)}%
                    </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-black/20">
                    <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-400 transition-all duration-500"></div>
                </div>
            </div>
        </div>
    );
}
