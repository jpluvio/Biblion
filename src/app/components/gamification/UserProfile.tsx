'use client';

import { useEffect, useState } from 'react';
import { getUserGamificationProfile } from '@/app/actions/gamification';
import { Award, Star, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';

type UserProfileProps = {
    userId: string;
};

type Badge = {
    id: string;
    name: string;
    description: string;
    icon: string;
    slug: string;
};

type UserBadge = {
    badge: Badge;
    awardedAt: Date;
};

type UserData = {
    xp: number;
    level: number;
    badges: UserBadge[];
};

export default function UserProfile({ userId }: UserProfileProps) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            getUserGamificationProfile(userId).then((data: any) => {
                if (data) {
                    setUserData(data);
                }
                setLoading(false);
            });
        }
    }, [userId]);

    if (loading) return <div className="animate-pulse h-24 bg-gray-100 rounded-lg"></div>;
    if (!userData) return null;

    // Calculate progress to next level
    // Level = floor(sqrt(XP/100)) + 1
    // Next Level XP = (Level)^2 * 100
    // Current Level Base XP = (Level - 1)^2 * 100
    const currentLevelBaseXP = Math.pow(userData.level - 1, 2) * 100;
    const nextLevelXP = Math.pow(userData.level, 2) * 100;
    const progress = ((userData.xp - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                        <Zap className="text-indigo-600 w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Level {userData.level}</h3>
                        <p className="text-sm text-gray-500">{userData.xp} XP</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Next Level: {nextLevelXP} XP</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Award className="w-4 h-4 mr-1 text-yellow-500" />
                    Achievements ({userData.badges.length})
                </h4>

                {userData.badges.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No badges earned yet. Start reading!</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {userData.badges.map((ub) => (
                            <div key={ub.badge.id} className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="bg-yellow-100 p-2 rounded-full mb-2">
                                    <Star className="w-4 h-4 text-yellow-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-800">{ub.badge.name}</span>
                                <span className="text-[10px] text-gray-500 mt-1">{ub.badge.description}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
