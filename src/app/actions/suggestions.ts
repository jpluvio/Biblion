'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface SuggestionCriteria {
    length?: 'any' | 'short' | 'medium' | 'long';
    categoryId?: string;
    language?: string;
}

export async function getSuggestion({ length = 'any', categoryId, language }: SuggestionCriteria = {}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return { success: false, error: 'User not found' };

        // We want to avoid suggesting books the user has already read, is reading, or dropped/paused.
        // We only want books with NO status for this user, OR explicitly 'To read'
        const excludedUserStatuses = ['Read', 'Reading', 'Paused', 'Dropped'];

        // Find book IDs we should exclude
        const excludedStatuses = await prisma.readingStatus.findMany({
            where: {
                userId: user.id,
                status: { in: excludedUserStatuses }
            },
            select: { bookId: true }
        });
        const excludedBookIds = excludedStatuses.map(s => s.bookId);

        // Build the where clause for the book query
        const where: any = {
            id: { notIn: excludedBookIds }
        };

        if (categoryId && categoryId !== 'any') {
            where.categories = {
                some: { id: categoryId }
            };
        }

        if (length && length !== 'any') {
            if (length === 'short') {
                where.pages = { lt: 250 };
            } else if (length === 'medium') {
                where.pages = { gte: 250, lte: 500 };
            } else if (length === 'long') {
                where.pages = { gt: 500 };
            }
        }

        if (language && language !== 'any') {
            where.language = language;
        }

        // Fetch all matching candidates
        const candidates = await prisma.book.findMany({
            where,
            include: {
                author: true,
                categories: true,
            }
        });

        if (candidates.length === 0) {
            return { success: true, suggestion: null };
        }

        // Randomly pick one from the candidates
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const suggestion = candidates[randomIndex];

        return { success: true, suggestion };

    } catch (error) {
        console.error('Failed to get suggestion:', error);
        return { success: false, error: 'Failed to get suggestion' };
    }
}

