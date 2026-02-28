'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { BookWithRelations } from '@/types/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { downloadImage } from '@/lib/imageUtils';

// --- Helpers ---

function parseCategoriesFromForm(formData: FormData): { id: string; name: string; isNew: boolean }[] {
    const categoriesJson = formData.get('categories') as string | null;
    try {
        if (categoriesJson) {
            const parsed = JSON.parse(categoriesJson);
            if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
                return parsed.map((name: string) => ({ id: '', name, isNew: true }));
            } else if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Failed to parse categories JSON', e);
        const legacyCat = formData.get('category') as string | null;
        if (legacyCat) return [{ id: '', name: legacyCat, isNew: true }];
    }
    return [];
}

async function resolveCategoryIds(categoriesData: { id: string; name: string; isNew: boolean }[]): Promise<string[]> {
    const categoryIds: string[] = [];
    for (const catData of categoriesData) {
        if (!catData.name.trim()) continue;
        if (catData.isNew || catData.id.startsWith('temp-') || !catData.id) {
            let category = await prisma.category.findUnique({ where: { name: catData.name.trim() } });
            if (!category) {
                category = await prisma.category.create({ data: { name: catData.name.trim() } });
            }
            categoryIds.push(category.id);
        } else {
            categoryIds.push(catData.id);
        }
    }
    return categoryIds;
}

function isCurrentUserOwner(owner: string | null, currentUser: { name?: string | null; email?: string | null } | null): boolean {
    if (!owner || !currentUser) return !owner;
    return (!!currentUser.name && owner === currentUser.name) || (!!currentUser.email && owner === currentUser.email);
}

export async function getBooks(filters?: { categoryId?: string, locationId?: string, query?: string, status?: string, sort?: string }) {
    try {
        const where: any = {};

        if (filters?.categoryId) {
            if (filters.categoryId === 'none') {
                where.categories = {
                    none: {}
                };
            } else {
                where.categories = {
                    some: {
                        id: filters.categoryId
                    }
                };
            }
        }

        if (filters?.status) {
            where.readingStatuses = {
                some: {
                    status: filters.status
                }
            };
        }

        if (filters?.locationId) {
            if (filters.locationId === 'none') {
                where.locationId = null;
            } else {
                where.locationId = filters.locationId;
            }
        }

        if (filters?.query) {
            const search = filters.query;
            where.OR = [
                { title: { contains: search } },
                { author: { name: { contains: search } } },
                { isbn: { contains: search } },
                { categories: { some: { name: { contains: search } } } },
                { tags: { some: { name: { contains: search } } } }
            ];
        }

        let orderBy: any = { title: 'asc' }; // Default is alphabetical Sort

        if (filters?.sort) {
            switch (filters.sort) {
                case 'title_desc':
                    orderBy = { title: 'desc' };
                    break;
                case 'created_desc':
                    orderBy = { createdAt: 'desc' };
                    break;
                case 'created_asc':
                    orderBy = { createdAt: 'asc' };
                    break;
                case 'title_asc':
                default:
                    orderBy = { title: 'asc' };
                    break;
            }
        }

        const books = await prisma.book.findMany({
            where,
            include: {
                author: true,
                categories: true,
                readingStatuses: {
                    select: {
                        status: true,
                        userId: true
                    }
                },
                location: true,
                loans: {
                    where: { returnedAt: null },
                    select: { id: true, user: { select: { id: true } } }
                }
            },
            orderBy,
        });
        return { success: true, books };
    } catch (error) {
        console.error('Failed to fetch books:', error);
        return { success: false, error: 'Failed to fetch books' };
    }
}

export async function getBook(id: string) {
    try {
        const session = await getServerSession(authOptions);
        let currentUserId = undefined;

        if (session?.user?.email) {
            const currentUser = await prisma.user.findUnique({
                where: { email: session.user.email },
            });
            currentUserId = currentUser?.id;
        }

        const book = await prisma.book.findUnique({
            where: { id },
            include: {
                author: true,
                categories: true,
                readingStatuses: {
                    where: { userId: currentUserId },
                    include: {
                        user: true,
                    },
                },
                tags: true,
                loans: {
                    where: { returnedAt: null },
                    include: {
                        user: true,
                    },
                },
                location: {
                    include: {
                        parent: {
                            include: {
                                parent: true
                            }
                        }
                    }
                },
            },
        });

        if (!book) return { success: false, error: 'Book not found' };

        return { success: true, book };
    } catch (error) {
        console.error('Failed to fetch book:', error);
        return { success: false, error: 'Failed to fetch book' };
    }
}

export async function getBooksByIds(ids: string[]) {
    try {
        if (!ids || ids.length === 0) return { success: true, books: [] };

        const books = await prisma.book.findMany({
            where: { id: { in: ids } },
            include: {
                author: true,
            },
            orderBy: { title: 'asc' }
        });

        return { success: true, books };
    } catch (error) {
        console.error('Failed to fetch books by IDs:', error);
        return { success: false, error: 'Failed to fetch books' };
    }
}

export async function addBook(formData: FormData) {
    try {
        const title = formData.get('title') as string;
        const authorName = formData.get('author') as string;
        const isbnRaw = formData.get('isbn') as string | null;
        const isbn = isbnRaw?.trim() || null;

        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: 'Unauthorized' };

        if (isbn) {
            const existingBook = await prisma.book.findFirst({ where: { isbn } });
            if (existingBook) {
                return { success: false, error: 'A book with this ISBN already exists in the library' };
            }
        }

        const categoriesData = parseCategoriesFromForm(formData);

        const language = formData.get('language') as string | null;
        const publisher = formData.get('publisher') as string | null;
        const publishYear = formData.get('publishYear') ? parseInt(formData.get('publishYear') as string) : null;
        const pages = formData.get('pages') ? parseInt(formData.get('pages') as string) : null;
        const owner = formData.get('owner') as string | null;
        const description = formData.get('description') as string | null;
        let coverImage = formData.get('coverImage') as string | null;
        const locationId = formData.get('locationId') as string | null;
        const tagsList = formData.getAll('tags') as string[];

        if (coverImage && !coverImage.startsWith('/')) {
            const downloadedCover = await downloadImage(coverImage);
            if (downloadedCover) coverImage = downloadedCover;
        }

        if (!title || !authorName) {
            return { success: false, error: 'Title and Author are required' };
        }

        let author = await prisma.author.findFirst({ where: { name: authorName } });
        if (!author) {
            author = await prisma.author.create({ data: { name: authorName } });
        }

        const categoryIds = await resolveCategoryIds(categoriesData);

        let currentUserId: string | undefined;
        let currentUser: { id: string; name?: string | null; email?: string | null } | null = null;

        if (session?.user?.email) {
            currentUser = await prisma.user.findUnique({
                where: { email: session.user.email },
            });
            currentUserId = currentUser?.id;
        }

        const ownerMatch = currentUserId && isCurrentUserOwner(owner, currentUser);
        const initialStatus = formData.get('initialStatus') as string || 'To read';

        const book = await prisma.book.create({
            data: {
                title,
                authorId: author.id,
                isbn,
                language,
                publisher,
                publishYear,
                pages,
                owner,
                description,
                coverImage,
                locationId: locationId || null,
                categories: {
                    connect: categoryIds.map(id => ({ id }))
                },
                tags: {
                    connectOrCreate: tagsList.map(tag => ({
                        where: { name: tag },
                        create: { name: tag }
                    }))
                },
                ...(ownerMatch ? { userId: currentUserId } : {}),
                ...(currentUserId ? {
                    readingStatuses: {
                        create: {
                            userId: currentUserId!,
                            status: initialStatus
                        }
                    }
                } : {})
            },
        });

        revalidatePath('/');
        return { success: true, book };
    } catch (error) {
        console.error('Failed to add book:', error);
        return { success: false, error: 'Failed to add book' };
    }
}

export async function updateBook(id: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        const title = formData.get('title') as string;
        const authorName = formData.get('author') as string;
        const isbnRaw = formData.get('isbn') as string | null;
        const isbn = isbnRaw?.trim() || null;

        if (isbn) {
            const existingBook = await prisma.book.findFirst({
                where: {
                    isbn,
                    NOT: { id }
                }
            });
            if (existingBook) {
                return { success: false, error: 'A book with this ISBN already exists in the library' };
            }
        }

        const categoriesData = parseCategoriesFromForm(formData);

        const language = formData.get('language') as string | null;
        const publisher = formData.get('publisher') as string | null;
        const publishYear = formData.get('publishYear') ? parseInt(formData.get('publishYear') as string) : null;
        const pages = formData.get('pages') ? parseInt(formData.get('pages') as string) : null;
        const owner = formData.get('owner') as string | null;
        const description = formData.get('description') as string | null;
        let coverImage = formData.get('coverImage') as string | null;
        const locationId = formData.get('locationId') as string | null;
        const tagsList = formData.getAll('tags') as string[];

        if (coverImage && !coverImage.startsWith('/')) {
            const downloadedCover = await downloadImage(coverImage);
            if (downloadedCover) coverImage = downloadedCover;
        }

        if (!title || !authorName) {
            return { success: false, error: 'Title and Author are required' };
        }

        let author = await prisma.author.findFirst({ where: { name: authorName } });
        if (!author) {
            author = await prisma.author.create({ data: { name: authorName } });
        }

        const categoryIds = await resolveCategoryIds(categoriesData);

        const book = await prisma.book.update({
            where: { id },
            data: {
                title,
                authorId: author.id,
                isbn,
                language,
                publisher,
                publishYear,
                pages,
                owner,
                description,
                coverImage,
                locationId: locationId || null,
                categories: {
                    set: categoryIds.map(id => ({ id }))
                },
                tags: {
                    set: [],
                    connectOrCreate: tagsList.map(tag => ({
                        where: { name: tag },
                        create: { name: tag }
                    }))
                }
            },
        });

        revalidatePath('/');
        revalidatePath(`/books/${id}`);
        return { success: true, book };
    } catch (error) {
        console.error('Failed to update book:', error);
        return { success: false, error: 'Failed to update book' };
    }
}

export async function deleteBook(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.book.delete({
            where: { id },
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete book:', error);
        return { success: false, error: 'Failed to delete book' };
    }
}


export async function bulkDeleteBooks(ids: string[]) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.book.deleteMany({
            where: { id: { in: ids } },
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to bulk delete books:', error);
        return { success: false, error: 'Failed to delete books' };
    }
}

export async function bulkUpdateCategory(ids: string[], categoryId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        // Prisma doesn't support bulk connect/disconnect for many-to-many. 
        // We have to iterate or run a raw query, or do individual updates in a transaction.
        const updates = ids.map(id => prisma.book.update({
            where: { id },
            data: {
                categories: {
                    connect: { id: categoryId }
                }
            }
        }));
        await prisma.$transaction(updates);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to bulk update categories:', error);
        return { success: false, error: 'Failed to update categories' };
    }
}

export async function bulkUpdateLocation(ids: string[], locationId: string | null) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.book.updateMany({
            where: { id: { in: ids } },
            data: { locationId }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to bulk update locations:', error);
        return { success: false, error: 'Failed to update locations' };
    }
}

export async function bulkUpdateReadingStatus(ids: string[], status: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return { success: false, error: 'User not found' };

        const updates = ids.map(bookId =>
            prisma.readingStatus.upsert({
                where: {
                    userId_bookId: {
                        userId: user.id,
                        bookId: bookId,
                    }
                },
                update: { status },
                create: {
                    userId: user.id,
                    bookId: bookId,
                    status
                }
            })
        );

        await prisma.$transaction(updates);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to bulk update status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}

export async function checkIsbnExists(isbn: string) {
    try {
        const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
        if (!cleanIsbn) return { exists: false };

        const book = await prisma.book.findFirst({
            where: { isbn: cleanIsbn },
            select: { id: true, title: true }
        });

        return { exists: !!book, bookId: book?.id, title: book?.title };
    } catch (error) {
        console.error('Failed to check ISBN:', error);
        return { exists: false };
    }
}
