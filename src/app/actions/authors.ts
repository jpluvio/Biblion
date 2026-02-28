'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateAuthor(id: string, data: { gender?: string | null }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const author = await prisma.author.update({
            where: { id },
            data: {
                gender: data.gender,
            },
        });

        revalidatePath(`/authors/${id}`);
        revalidatePath('/stats'); // Stats depend on gender
        return { success: true, author };
    } catch (error) {
        console.error('Failed to update author:', error);
        return { success: false, error: 'Failed to update author' };
    }
}

export async function getAuthors(filters?: { query?: string }) {
    try {
        const where: any = {};

        if (filters?.query) {
            where.name = { contains: filters.query };
        }

        const authors = await prisma.author.findMany({
            where,
            include: {
                books: true,
            },
            orderBy: { name: 'asc' },
        });

        return { success: true, authors };
    } catch (error) {
        console.error('Failed to fetch authors:', error);
        return { success: false, error: 'Failed to fetch authors' };
    }
}

export async function fetchAndSaveAuthorBio(authorId: string, authorName: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    try {
        const searchQuery = `${authorName} writer`;
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=1`;

        const searchRes = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'BiblionApp/1.0',
                'Accept': 'application/json'
            }
        });
        const searchData = await searchRes.json();

        if (searchData.query?.search?.length > 0) {
            const pageTitle = searchData.query.search[0].title;
            const pageId = searchData.query.search[0].pageid;

            const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro&explaintext&redirects=1&pageids=${pageId}`;
            const extractRes = await fetch(extractUrl, {
                headers: {
                    'User-Agent': 'BiblionApp/1.0',
                    'Accept': 'application/json'
                }
            });
            const extractData = await extractRes.json();

            const pages = extractData.query?.pages;
            const page = pages?.[pageId] || Object.values(pages || {})[0];

            if (page && (page as any).extract) {
                let text = (page as any).extract;
                if (text.length > 600) {
                    text = text.substring(0, 600) + '...';
                }

                await prisma.author.update({
                    where: { id: authorId },
                    data: { biography: text }
                });

                return { success: true, bio: text };
            }
        }
        return { success: false, error: 'No biography found' };
    } catch (error) {
        console.error('Failed to fetch and save bio:', error);
        return { success: false, error: 'Failed to fetch and save bio' };
    }
}
