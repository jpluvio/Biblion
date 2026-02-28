'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { addXP, checkBadges } from '@/app/actions/gamification';

export async function updateReadingStatus(bookId: string, status: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return { success: false, error: 'Unauthorized' };
    }

    // Get User ID from email (since session.user.id might not be populated in all flows)
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    try {
        // Exclusivity Check: If status is 'Reading', ensure no one else is reading it
        if (status === 'Reading') {
            const activeReaders = await prisma.readingStatus.findFirst({
                where: {
                    bookId,
                    status: 'Reading',
                    userId: { not: user.id },
                },
                include: { user: true },
            });

            if (activeReaders) {
                return {
                    success: false,
                    error: `Book is currently being read by ${activeReaders.user.name || activeReaders.user.email}`
                };
            }
        }

        // Upsert status
        await prisma.readingStatus.upsert({
            where: {
                userId_bookId: {
                    userId: user.id,
                    bookId,
                },
            },
            update: { status },
            create: {
                userId: user.id,
                bookId,
                status,
            },
        });

        // GAMIFICATION: Award XP if status is 'Read'
        if (status === 'Read') {
            const book = await prisma.book.findUnique({
                where: { id: bookId },
                select: { pages: true },
            });

            if (book) {
                // Logic: 1 XP per page + 100 XP fixed bonus for finishing a book
                const pagesXP = book.pages || 0;
                const bonusXP = 100;
                const totalXP = pagesXP + bonusXP;

                await addXP(user.id, totalXP);
                await checkBadges(user.id);
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}


