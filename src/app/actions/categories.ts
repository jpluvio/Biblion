'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type CategoryWithChildren = {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    parentId: string | null;
    children?: CategoryWithChildren[];
    _count?: {
        books: number;
    };
};

export async function getCategories() {
    try {
        // Helper to build nested include for N levels
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

        const rootCategories = await prisma.category.findMany({
            where: { parentId: null },
            include: {
                _count: { select: { books: true } },
                children: buildChildrenInclude(4), // 4 more levels below root = 5 total
            },
            orderBy: { name: 'asc' },
        });

        return { success: true, categories: rootCategories };
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return { success: false, error: 'Failed to fetch categories' };
    }
}

export async function createCategory(name: string, color?: string | null, icon?: string | null, parentId?: string | null) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        if (!name) {
            return { success: false, error: 'Name is required' };
        }

        // Check max depth (5 levels)
        if (parentId) {
            let depth = 0;
            let current = await prisma.category.findUnique({ where: { id: parentId } });
            while (current?.parentId) {
                depth++;
                current = await prisma.category.findUnique({ where: { id: current.parentId } });
            }
            if (depth >= 4) {
                return { success: false, error: 'Maximum category depth is 5 levels' };
            }
        }

        const category = await prisma.category.create({
            data: {
                name,
                color: color || null,
                icon: icon || null,
                parentId: parentId || null,
            },
        });

        revalidatePath('/admin/categories');
        return { success: true, category };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Category name already exists' };
        }
        console.error('Failed to create category:', error);
        return { success: false, error: 'Failed to create category' };
    }
}

export async function updateCategory(id: string, name: string, color?: string | null, icon?: string | null, parentId?: string | null) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        if (!name) {
            return { success: false, error: 'Name is required' };
        }

        // Prevent setting parent to itself
        if (id === parentId) {
            return { success: false, error: 'Category cannot be its own parent' };
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                color: color || null,
                icon: icon || null,
                parentId: parentId || null,
            },
        });

        revalidatePath('/admin/categories');
        return { success: true, category };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Category name already exists' };
        }
        console.error('Failed to update category:', error);
        return { success: false, error: 'Failed to update category' };
    }
}

export async function deleteCategory(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        // Check for dependencies
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                books: true,
                children: true,
            },
        });

        if (!category) {
            return { success: false, error: 'Category not found' };
        }

        if (category.books.length > 0) {
            return {
                success: false,
                error: `Cannot delete category: contains ${category.books.length} book(s). Please move them first.`
            };
        }

        if (category.children.length > 0) {
            return {
                success: false,
                error: `Cannot delete category: contains ${category.children.length} subcategory(ies). Please delete or move them first.`
            };
        }

        await prisma.category.delete({
            where: { id },
        });

        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete category:', error);
        return { success: false, error: 'Failed to delete category' };
    }
}

export async function updateCategoryParent(categoryId: string, newParentId: string | null) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        if (categoryId === newParentId) {
            return { success: false, error: 'Category cannot be its own parent' };
        }

        // Prevent circular reference: check if newParentId is a descendant of categoryId
        if (newParentId) {
            let current = await prisma.category.findUnique({ where: { id: newParentId } });
            let depth = 0;
            while (current?.parentId) {
                depth++;
                if (current.parentId === categoryId) {
                    return { success: false, error: 'Cannot create circular category hierarchy' };
                }
                current = await prisma.category.findUnique({ where: { id: current.parentId } });
            }
            // depth = number of ancestors above newParentId. The moved category would be at depth+1.
            // Max 5 levels total means max depth index = 4 (0-indexed root).
            if (depth >= 4) {
                return { success: false, error: 'Maximum category depth is 5 levels' };
            }
        }

        await prisma.category.update({
            where: { id: categoryId },
            data: { parentId: newParentId },
        });

        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update category parent:', error);
        return { success: false, error: 'Failed to move category' };
    }
}

