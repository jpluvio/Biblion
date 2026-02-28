'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// Define the type based on the include query
type BookWithStats = Prisma.BookGetPayload<{
    include: {
        author: true;
        categories: true;
        tags: true;
        readingStatuses: {
            select: {
                status: true;
                updatedAt: true;
            };
        };
    };
}>;

type StatsScope = 'all' | 'owned';

export async function getLibraryStats(scope: StatsScope = 'all', year?: number) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const userId = user.id;

        // 1. Determine base query for Books based on Scope
        const whereClause: Prisma.BookWhereInput = {};
        if (scope === 'owned') {
            whereClause.userId = userId;
        }
        // If scope === 'all', whereClause is empty (fetch all books)

        // 2. Fetch Books in Scope
        const books = await prisma.book.findMany({
            where: whereClause,
            include: {
                author: true,
                categories: true,
                tags: true,
                readingStatuses: {
                    where: { userId }, // Fetch ONLY current user's status for these books
                    select: {
                        status: true,
                        updatedAt: true
                    }
                }
            }
        });

        // 3. Process Books to derive Stats items
        const effectiveItems = (books as BookWithStats[]).map(book => {
            const userStatus = book.readingStatuses[0];

            let effectiveStatus = userStatus?.status;

            // Implicit Status Logic:
            // Any book in scope without an explicit status defaults to 'To read'
            if (!effectiveStatus) {
                effectiveStatus = 'To read';
            }

            // Normalize AFTER implicit status assignment
            const normalizedStatus = effectiveStatus?.toLowerCase() || '';

            return {
                book,
                status: effectiveStatus,
                normalizedStatus,
                updatedAt: userStatus?.updatedAt || book.updatedAt
            };
        });

        const totalBooks = effectiveItems.length;
        const readCount = effectiveItems.filter(i => i.normalizedStatus === 'read').length;
        const toReadCount = effectiveItems.filter(i => i.normalizedStatus === 'to read').length;
        const readingCount = effectiveItems.filter(i => i.normalizedStatus === 'reading').length;
        const studyingCount = effectiveItems.filter(i => i.normalizedStatus === 'studying').length;

        // Helper interface for accumulating stats with bookIds
        interface SegmentStat { count: number; bookIds: string[] }

        // Gender Distribution
        const genderStats: Record<string, SegmentStat> = {};
        effectiveItems.forEach(i => {
            const gender = i.book.author.gender || 'Unknown';
            if (!genderStats[gender]) genderStats[gender] = { count: 0, bookIds: [] };
            genderStats[gender].count++;
            genderStats[gender].bookIds.push(i.book.id);
        });
        const genderData = Object.entries(genderStats).map(([name, { count, bookIds }]) => ({ name, value: count, bookIds }));

        // Status Distribution
        const statusStats: Record<string, SegmentStat> = {};
        effectiveItems.forEach(i => {
            if (i.status) {
                const displayStatus = i.status.charAt(0).toUpperCase() + i.status.slice(1).toLowerCase();
                if (!statusStats[displayStatus]) statusStats[displayStatus] = { count: 0, bookIds: [] };
                statusStats[displayStatus].count++;
                statusStats[displayStatus].bookIds.push(i.book.id);
            }
        });
        const statusData = Object.entries(statusStats).map(([name, { count, bookIds }]) => ({ name, value: count, bookIds }));

        // Reading Activity
        const activityStats: Record<string, SegmentStat> = {};
        effectiveItems.filter(i => i.normalizedStatus === 'read').forEach(i => {
            const yearStr = i.updatedAt.getFullYear().toString();
            if (!activityStats[yearStr]) activityStats[yearStr] = { count: 0, bookIds: [] };
            activityStats[yearStr].count++;
            activityStats[yearStr].bookIds.push(i.book.id);
        });
        const activityData = Object.entries(activityStats)
            .map(([year, { count, bookIds }]) => ({ year, count, bookIds }))
            .sort((a, b) => a.year.localeCompare(b.year));

        // Category Distribution
        const categoryStats: Record<string, SegmentStat> = {};
        effectiveItems.forEach(i => {
            if (i.book.categories && i.book.categories.length > 0) {
                i.book.categories.forEach(cat => {
                    if (!categoryStats[cat.name]) categoryStats[cat.name] = { count: 0, bookIds: [] };
                    categoryStats[cat.name].count++;
                    categoryStats[cat.name].bookIds.push(i.book.id);
                });
            }
        });

        // Sort categories by count desc
        const categoryData = Object.entries(categoryStats)
            .map(([name, { count, bookIds }]) => ({ name, value: count, bookIds }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 categories

        // Language Distribution
        const languageStats: Record<string, SegmentStat> = {};
        effectiveItems.forEach(i => {
            const language = i.book.language || 'Unknown';
            if (!languageStats[language]) languageStats[language] = { count: 0, bookIds: [] };
            languageStats[language].count++;
            languageStats[language].bookIds.push(i.book.id);
        });
        const languageData = Object.entries(languageStats).map(([name, { count, bookIds }]) => ({ name, value: count, bookIds })).sort((a, b) => b.value - a.value);

        // Books Added per Month (for selected year)
        const targetYear = year || new Date().getFullYear();
        const booksAddedStats = new Array(12).fill(null).map(() => ({ count: 0, bookIds: [] as string[] }));
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        effectiveItems.forEach(i => {
            const date = new Date(i.book.createdAt);
            if (date.getFullYear() === targetYear) {
                booksAddedStats[date.getMonth()].count++;
                booksAddedStats[date.getMonth()].bookIds.push(i.book.id);
            }
        });

        const booksAddedData = booksAddedStats.map((stat, index) => ({
            month: MONTHS[index],
            count: stat.count,
            bookIds: stat.bookIds
        }));

        return {
            success: true,
            stats: {
                totalBooks,
                totalRead: readCount,
                totalToRead: toReadCount,
                totalReading: readingCount,
                totalStudying: studyingCount,
                genderData,
                statusData,
                activityData,
                categoryData,
                booksAddedData,
                languageData
            }
        };

    } catch (error) {
        console.error('Failed to get stats:', error);
        return { success: false, error: 'Failed to fetch statistics' };
    }
}
