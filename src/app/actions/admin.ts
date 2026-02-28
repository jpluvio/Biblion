'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

// Helper to check admin role
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return false;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    return user?.role === 'ADMIN';
}

export async function getUsers() {
    if (!(await checkAdmin())) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { ownedBooks: true }
                }
            }
        });
        return { success: true, users };
    } catch (error) {
        console.error('getUsers error:', error);
        return { success: false, error: 'Failed to fetch users' };
    }
}

export async function deleteUser(userId: string) {
    if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.user.delete({ where: { id: userId } });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete user' };
    }
}

export async function updateUserRole(userId: string, role: string) {
    if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update role' };
    }
}

export async function addUser(formData: FormData) {
    if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string || 'USER';

    if (!email || !password) return { success: false, error: 'Email and Password required' };

    try {
        const hashedPassword = await hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to create user' };
    }
}

export async function updateUserPassword(userId: string, newPasswordRaw: string) {
    if (!(await checkAdmin())) return { success: false, error: 'Unauthorized' };

    if (!newPasswordRaw || newPasswordRaw.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    try {
        const hashedPassword = await hash(newPasswordRaw, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error('updateUserPassword error:', error);
        return { success: false, error: 'Failed to update user password' };
    }
}
