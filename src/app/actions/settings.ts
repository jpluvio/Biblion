'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export async function getSetting(key: string) {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key }
        });
        return { success: true, value: setting?.value || null };
    } catch (error) {
        console.error('Error fetching setting:', error);
        return { success: false, error: 'Failed to fetch setting' };
    }
}

export async function updateSetting(key: string, value: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized: Admins only' };
        }

        await prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating setting:', error);
        return { success: false, error: 'Failed to update setting' };
    }
}

export async function triggerManualBackup() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized: Admins only' };
        }

        const setting = await prisma.setting.findUnique({ where: { key: 'backupPath' } });
        if (!setting || !setting.value) {
            return { success: false, error: 'Backup path not configured. Please save a path first.' };
        }

        const backupDir = setting.value;

        // Ensure directory exists
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        if (!fs.existsSync(dbPath)) {
            return { success: false, error: 'Main database file not found' };
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backup-${timestamp}.db`;
        const destPath = path.join(backupDir, backupFileName);

        fs.copyFileSync(dbPath, destPath);

        return { success: true, message: `Backup created successfully at ${destPath}` };

    } catch (error: any) {
        console.error('Backup failed:', error);
        return { success: false, error: error.message || 'Failed to create backup' };
    }
}
