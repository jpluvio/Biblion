'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type LocationWithChildren = {
    id: string;
    name: string;
    parentId: string | null;
    _count: { books: number };
    children?: LocationWithChildren[];
};

// Maximum depth is 3: Room -> Bookcase -> Shelf
const MAX_DEPTH = 3;

/**
 * Helper to build the nested include structure for Locations
 */
const buildChildrenInclude = (depth: number): any => {
    if (depth <= 0) return undefined;
    return {
        include: {
            _count: { select: { books: true } },
            ...(depth > 1 ? { children: buildChildrenInclude(depth - 1) } : {}),
        },
        orderBy: { name: 'asc' as const },
    };
};

export async function getLocations() {
    try {
        const rootLocations = await prisma.location.findMany({
            where: { parentId: null },
            include: {
                _count: { select: { books: true } },
                children: buildChildrenInclude(MAX_DEPTH - 1), // fetch up to max depth
            },
            orderBy: { name: 'asc' },
        });
        return { success: true, locations: rootLocations as unknown as LocationWithChildren[] };
    } catch (error) {
        console.error('Error fetching locations:', error);
        return { success: false, error: 'Failed to fetch locations' };
    }
}

export async function createLocation(name: string, parentId?: string | null) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        // Validate depth
        if (parentId) {
            let depth = 0;
            let current = await prisma.location.findUnique({ where: { id: parentId } });
            while (current?.parentId) {
                depth++;
                current = await prisma.location.findUnique({ where: { id: current.parentId } });
            }
            if (depth >= MAX_DEPTH - 1) {
                return { success: false, error: `Maximum location depth is ${MAX_DEPTH} levels.` };
            }
        }

        const location = await prisma.location.create({
            data: {
                name,
                parentId: parentId || null,
            },
        });
        revalidatePath('/admin/locations');
        revalidatePath('/');
        return { success: true, location };
    } catch (error) {
        console.error('Error creating location:', error);
        return { success: false, error: 'Failed to create location' };
    }
}

export async function updateLocation(id: string, name: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        const location = await prisma.location.update({
            where: { id },
            data: { name },
        });
        revalidatePath('/admin/locations');
        revalidatePath('/');
        return { success: true, location };
    } catch (error) {
        console.error('Error updating location:', error);
        return { success: false, error: 'Failed to update location' };
    }
}

export async function updateLocationParent(id: string, parentId: string | null) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        if (id === parentId) {
            return { success: false, error: 'Cannot set a location as its own parent' };
        }

        // Prevent circular references
        if (parentId) {
            let currentParent = await prisma.location.findUnique({ where: { id: parentId } });
            while (currentParent) {
                if (currentParent.id === id) {
                    return { success: false, error: 'Circular reference detected' };
                }
                if (!currentParent.parentId) break;
                currentParent = await prisma.location.findUnique({ where: { id: currentParent.parentId } });
            }
        }

        // Validate max depth
        if (parentId) {
            let depth = 0;
            let currentObj = await prisma.location.findUnique({ where: { id: parentId } });
            while (currentObj?.parentId) {
                depth++;
                currentObj = await prisma.location.findUnique({ where: { id: currentObj.parentId } });
            }
            if (depth >= MAX_DEPTH - 1) {
                return { success: false, error: `Maximum location depth is ${MAX_DEPTH} levels.` };
            }
        }

        const location = await prisma.location.update({
            where: { id },
            data: { parentId },
        });
        revalidatePath('/admin/locations');
        revalidatePath('/');
        return { success: true, location };
    } catch (error) {
        console.error('Error updating location parent:', error);
        return { success: false, error: 'Failed to move location' };
    }
}

export async function deleteLocation(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.location.delete({
            where: { id },
        });
        revalidatePath('/admin/locations');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting location:', error);
        return { success: false, error: 'Failed to delete location' };
    }
}
