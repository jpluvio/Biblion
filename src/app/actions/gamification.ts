'use server';

import prisma from '@/lib/prisma';

// Calculate level based on XP: Level = floor(sqrt(XP / 100)) + 1
// Example: 0 XP = Lvl 1, 100 XP = Lvl 2, 400 XP = Lvl 3
function calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export async function addXP(userId: string, amount: number) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { xp: true, level: true },
        });

        if (!user) return;

        const newXP = user.xp + amount;
        const newLevel = calculateLevel(newXP);

        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: newXP,
                level: newLevel,
            },
        });

        // Check for level-up badges or notifications could go here
    } catch (error) {
        console.error('Failed to add XP:', error);
    }
}

export async function checkBadges(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                readingStatuses: { where: { status: 'Read' } },
                badges: { include: { badge: true } },
            },
        });

        if (!user) return;

        const readCount = user.readingStatuses.length;
        const existingBadgeSlugs = new Set(user.badges.map(ub => ub.badge.slug));

        // Define Badges Logic
        const badgesToAward: string[] = [];

        // 1. First Read
        if (readCount >= 1 && !existingBadgeSlugs.has('first-read')) {
            badgesToAward.push('first-read');
        }

        // 2. Bookworm (5 books)
        if (readCount >= 5 && !existingBadgeSlugs.has('bookworm')) {
            badgesToAward.push('bookworm');
        }

        // 3. Scholar (10 books)
        if (readCount >= 10 && !existingBadgeSlugs.has('scholar')) {
            badgesToAward.push('scholar');
        }

        // Award Badges
        for (const slug of badgesToAward) {
            const badge = await prisma.badge.findUnique({ where: { slug } });
            if (badge) {
                await prisma.userBadge.create({
                    data: {
                        userId,
                        badgeId: badge.id,
                    },
                });
                // Award XP bonus for badge
                if (badge.xpBonus > 0) {
                    await addXP(userId, badge.xpBonus);
                }
            }
        }
    } catch (error) {
        console.error('Failed to check badges:', error);
    }
}

export async function getUserGamificationProfile(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                xp: true,
                level: true,
                badges: {
                    include: {
                        badge: true,
                    },
                    orderBy: {
                        awardedAt: 'desc',
                    },
                },
            },
        });
        return user;
    } catch (error) {
        console.error('Failed to get user gamification profile:', error);
        return null;
    }
}
