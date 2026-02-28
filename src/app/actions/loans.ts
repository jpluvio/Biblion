'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Lend a book to someone
export async function lendBook(bookId: string, borrowerName: string) {
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

        if (!borrowerName || borrowerName.trim() === '') {
            return { success: false, error: 'Borrower name is required' };
        }

        // Check if book is already borrowed
        const activeLoan = await prisma.loan.findFirst({
            where: {
                bookId,
                returnedAt: null,
            },
        });

        if (activeLoan) {
            return { success: false, error: 'Book is currently borrowed' };
        }

        // Create loan
        await prisma.$transaction(async (tx) => {
            // 0. Get current status to save it
            const currentStatusRecord = await tx.readingStatus.findUnique({
                where: {
                    userId_bookId: {
                        userId: user.id,
                        bookId: bookId,
                    }
                }
            });
            const previousStatus = currentStatusRecord?.status || 'To read';

            // 1. Create the loan record with previousStatus
            await tx.loan.create({
                data: {
                    lenderId: user.id,
                    bookId,
                    borrowerName,
                    // Default due date: 14 days from now (optional)
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    previousStatus,
                },
            });

            // 2. Update lender's reading status to 'Lent'
            await tx.readingStatus.upsert({
                where: {
                    userId_bookId: {
                        userId: user.id,
                        bookId: bookId,
                    }
                },
                update: { status: 'Lent' },
                create: {
                    userId: user.id,
                    bookId: bookId,
                    status: 'Lent'
                }
            });
        });

        revalidatePath('/');
        revalidatePath(`/books/${bookId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to lend book:', error);
        return { success: false, error: 'Failed to lend book' };
    }
}

// Return a book
export async function returnBook(loanId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        // Verify the loan belongs to the lender (user) OR user is admin
        const loan = await prisma.loan.findUnique({
            where: { id: loanId },
            include: { user: true },
        });

        if (!loan) {
            return { success: false, error: 'Loan not found' };
        }

        if (loan.user.email !== session.user.email && session.user.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized to return this book' };
        }

        if (loan.returnedAt) {
            return { success: false, error: 'Book already returned' };
        }

        await prisma.$transaction(async (tx) => {
            // 1. Mark loan as returned
            const updatedLoan = await tx.loan.update({
                where: { id: loanId },
                data: { returnedAt: new Date() },
            });

            // 2. Revert lender's reading status to previous status
            const statusToRestore = updatedLoan.previousStatus || 'To read';

            await tx.readingStatus.updateMany({
                where: {
                    userId: loan.lenderId,
                    bookId: loan.bookId,
                },
                data: { status: statusToRestore }
            });
        });

        revalidatePath('/');
        revalidatePath(`/books/${loan.bookId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to return book:', error);
        return { success: false, error: 'Failed to return book' };
    }
}

// Get active loans for the current user (Lent books)
export async function getMyLoans() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const loans = await prisma.loan.findMany({
            where: {
                user: { email: session.user.email }, // This now refers to lender
                returnedAt: null,
            },
            include: {
                book: {
                    include: { author: true }
                }
            },
            orderBy: { borrowedAt: 'desc' },
        });

        return { success: true, loans };
    } catch (error) {
        console.error('Failed to fetch loans:', error);
        return { success: false, error: 'Failed to fetch loans' };
    }
}

// Get all active loans (Admin only)
export async function getActiveLoans() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }

        const loans = await prisma.loan.findMany({
            where: {
                returnedAt: null,
            },
            include: {
                book: true,
                user: true, // Includes lender info
            },
            orderBy: { borrowedAt: 'desc' },
        });

        return { success: true, loans };
    } catch (error) {
        console.error('Failed to fetch active loans:', error);
        return { success: false, error: 'Failed to fetch active loans' };
    }
}
