'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function hasAnyUsers(): Promise<boolean> {
    try {
        const count = await prisma.user.count();
        return count > 0;
    } catch (error) {
        console.error('CRITICAL ERROR in hasAnyUsers:', error);
        // Force true so we don't infinitely loop or crash if there's a weird edge case,
        // although logging the error is the main goal here.
        throw error;
    }
}

export async function setupFirstUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { success: false, error: 'All fields are required.' };
    }

    if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Safety guard: only allow if no users exist yet
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
        return { success: false, error: 'Setup has already been completed.' };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        // Seed default badges
        const badges = [
            { slug: 'first-read', name: 'First Step', description: 'Read your first book', icon: 'award', xpBonus: 50 },
            { slug: 'bookworm', name: 'Bookworm', description: 'Read 5 books', icon: 'book-open', xpBonus: 150 },
            { slug: 'scholar', name: 'Scholar', description: 'Read 10 books', icon: 'graduation-cap', xpBonus: 300 },
            { slug: 'page-turner', name: 'Page Turner', description: 'Read a book with more than 500 pages', icon: 'book', xpBonus: 200 },
        ];

        for (const badge of badges) {
            await prisma.badge.upsert({
                where: { slug: badge.slug },
                update: {},
                create: badge,
            });
        }

        // Seed default categories
        const categories = [
            { name: 'Fiction', color: '#3b82f6', icon: 'Book' },
            { name: 'Non-Fiction', color: '#ef4444', icon: 'BookOpen' },
            { name: 'Sci-Fi', color: '#8b5cf6', icon: 'Rocket' },
            { name: 'Fantasy', color: '#10b981', icon: 'Wand2' },
            { name: 'Mystery', color: '#f59e0b', icon: 'Search' },
            { name: 'Biography', color: '#ec4899', icon: 'User' },
            { name: 'History', color: '#78716c', icon: 'Hourglass' },
            { name: 'Science', color: '#06b6d4', icon: 'FlaskConical' },
            { name: 'Technology', color: '#6366f1', icon: 'Cpu' },
        ];

        for (const cat of categories) {
            await prisma.category.upsert({
                where: { name: cat.name },
                update: {},
                create: cat,
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Setup error:', error);
        return { success: false, error: 'Failed to create user. Please try again.' };
    }
}
