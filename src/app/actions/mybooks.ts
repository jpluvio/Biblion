'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getMyBooks(filters?: { status?: string, query?: string }) {
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

    // Helper to build search filter
    const getSearchFilter = (query?: string) => {
        if (!query) return {};
        return {
            OR: [
                { title: { contains: query } },
                { author: { name: { contains: query } } },
                { isbn: { contains: query } },
                { categories: { some: { name: { contains: query } } } },
                { tags: { some: { name: { contains: query } } } }
            ]
        };
    };

    const searchFilter = getSearchFilter(filters?.query);

    try {
        // Build ownership conditions: match by userId FK or legacy owner text field
        const ownerConditions: any[] = [{ userId: user.id }];
        if (user.name) ownerConditions.push({ owner: user.name });
        if (user.email) ownerConditions.push({ owner: user.email });

        // Status filter — if filtering by status, we need to match ReadingStatus for THIS user
        const statusFilter: any = {};
        if (filters?.status && filters.status !== 'All') {
            statusFilter.readingStatuses = {
                some: {
                    userId: user.id,
                    status: filters.status,
                }
            };
        }

        // Fetch all books owned by the user, with optional status and search filters
        const ownedBooks = await prisma.book.findMany({
            where: {
                AND: [
                    { OR: ownerConditions },
                    searchFilter,
                    statusFilter,
                ]
            },
            include: {
                author: true,
                categories: true,
                readingStatuses: {
                    include: { user: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Build the status list: use the user's ReadingStatus if it exists, else "To read"
        const statuses = ownedBooks.map(book => {
            const userStatus = book.readingStatuses.find(rs => rs.userId === user.id);
            if (userStatus) {
                return {
                    ...userStatus,
                    book: book,
                };
            }
            // Implicit "To read" for owned books without a status
            return {
                id: `implicit-${book.id}`,
                status: 'To read',
                updatedAt: book.updatedAt,
                book: book,
                userId: user.id,
                bookId: book.id,
            };
        });

        // If filtering by a specific status, implicit books only match "To read" or "All"
        const filteredStatuses = filters?.status && filters.status !== 'All' && filters.status !== 'To read'
            ? statuses.filter(s => !s.id.toString().startsWith('implicit-'))
            : statuses;

        return { success: true, statuses: filteredStatuses };
    } catch (error) {
        console.error('Failed to fetch my books:', error);
        return { success: false, error: 'Failed to fetch your books' };
    }
}

