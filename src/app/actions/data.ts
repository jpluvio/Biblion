'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// --- Export Logic ---

export async function exportData(format: 'json' | 'csv') {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        // Fetch all data
        // We fetch books and include related entities needed for a full backup
        const books = await prisma.book.findMany({
            include: {
                author: true,
                categories: true,
                readingStatuses: {
                    include: { user: { select: { email: true, name: true } } }
                },
                // We could include loans, but restoring loans might be complex if users don't match exactly.
                // For now, let's include them for JSON backup.
                loans: {
                    include: { user: { select: { email: true, name: true } } }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        if (format === 'json') {
            // Full backup
            const fullData = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                exportUser: session.user.email,
                books: books
            };
            return { success: true, data: JSON.stringify(fullData, null, 2), filename: `library_backup_${new Date().toISOString().split('T')[0]}.json` };
        } else {
            // CSV Export - Flattened
            // Columns: Title, Author, ISBN, Language, Publish Year, Pages, Owner, Description, Categories, Status (for exporter)
            const headers = ['Title', 'Author', 'ISBN', 'Language', 'Publish Year', 'Pages', 'Owner', 'Description', 'Categories', 'My Status'];

            const rows = books.map(book => {
                const myStatus = book.readingStatuses.find(rs => rs.user.email === session.user?.email)?.status || 'To read';
                const categories = book.categories.map(c => c.name).join('; '); // Semicolon separated

                return [
                    // Escape quotes and handle commas in CSV
                    escapeCsv(book.title),
                    escapeCsv(book.author.name),
                    escapeCsv(book.isbn || ''),
                    escapeCsv(book.language || ''),
                    book.publishYear?.toString() || '',
                    book.pages?.toString() || '',
                    escapeCsv(book.owner || ''),
                    escapeCsv(book.description || ''),
                    escapeCsv(categories),
                    escapeCsv(myStatus)
                ].join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');
            return { success: true, data: csvContent, filename: `library_export_${new Date().toISOString().split('T')[0]}.csv` };
        }

    } catch (error) {
        console.error('Export failed:', error);
        return { success: false, error: 'Export failed' };
    }
}

function escapeCsv(str: string): string {
    if (!str) return '';
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}


// --- Import Logic ---

export async function importData(content: string, format: 'json' | 'csv') {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) return { success: false, error: 'User not found' };

        let importStats = {
            total: 0,
            created: 0,
            updated: 0,
            failed: 0,
            errors: [] as string[]
        };

        if (format === 'json') {
            const data = JSON.parse(content);
            if (!data.books || !Array.isArray(data.books)) {
                return { success: false, error: 'Invalid JSON format: missing books array' };
            }

            importStats.total = data.books.length;

            for (const item of data.books) {
                try {
                    await upsertBookFromJson(item, currentUser.id);
                    importStats.created++; // Simplified tracking (upserts count as 'processed')
                } catch (e: any) {
                    importStats.failed++;
                    importStats.errors.push(`Failed to import "${item.title}": ${e.message}`);
                    console.error('Import item error:', e);
                }
            }
        } else {
            // CSV Import
            const lines = content.split('\n');
            if (lines.length < 2) return { success: false, error: 'Empty CSV' };

            // Basic CSV parser handling quoted fields

            const dataRows = lines.slice(1).filter(l => l.trim().length > 0);
            importStats.total = dataRows.length;

            for (const line of dataRows) {
                try {
                    const cols = parseCsvLine(line);
                    // Mapping: 0=Title, 1=Author, 2=ISBN
                    if (cols.length < 2) continue; // Skip malformed

                    await upsertBookFromCsv(cols, currentUser.id);
                    importStats.created++;
                } catch (e: any) {
                    importStats.failed++;
                    importStats.errors.push(`Failed to import line: ${e.message}`);
                }
            }
        }

        revalidatePath('/');
        return { success: true, stats: importStats };

    } catch (error) {
        console.error('Import failed:', error);
        return { success: false, error: 'Import failed' };
    }
}

function parseCsvLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"'; // Escaped quote
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// Helpers

async function upsertBookFromJson(data: any, currentUserId: string) {
    // 1. Author
    let authorName = data.author?.name || 'Unknown Author';
    let author = await prisma.author.findFirst({ where: { name: authorName } });
    if (!author) {
        author = await prisma.author.create({ data: { name: authorName } });
    }

    // 2. Categories
    const categoryIds: string[] = [];
    if (data.categories && Array.isArray(data.categories)) {
        for (const cat of data.categories) {
            const catName = cat.name;
            if (!catName) continue;
            let category = await prisma.category.findUnique({ where: { name: catName } });
            if (!category) {
                category = await prisma.category.create({ data: { name: catName, color: cat.color, icon: cat.icon } });
            }
            categoryIds.push(category.id);
        }
    }

    // 3. Book
    // Try to find by ID first (backup restore), then ISBN, then Title+Author
    let book = await prisma.book.findUnique({ where: { id: data.id || 'non-existent' } });

    if (!book && data.isbn) {
        book = await prisma.book.findFirst({ where: { isbn: data.isbn } });
    }

    if (!book) {
        book = await prisma.book.findFirst({
            where: {
                title: data.title,
                authorId: author.id
            }
        });
    }

    const payload = {
        title: data.title,
        authorId: author.id,
        isbn: data.isbn,
        language: data.language,
        publishYear: data.publishYear,
        pages: data.pages,
        owner: data.owner,
        description: data.description,
        coverImage: data.coverImage,
    };

    if (book) {
        // Update
        await prisma.book.update({
            where: { id: book.id },
            data: {
                ...payload,
                categories: {
                    set: categoryIds.map(id => ({ id }))
                }
            }
        });
    } else {
        // Create
        await prisma.book.create({
            data: {
                ...payload,
                categories: {
                    connect: categoryIds.map(id => ({ id }))
                },
                // Restore reading status for current user
                readingStatuses: {
                    create: {
                        userId: currentUserId,
                        status: 'To read'
                    }
                }
            }
        });
    }
}

async function upsertBookFromCsv(cols: string[], currentUserId: string) {
    // Columns: 0:Title, 1:Author, 2:ISBN, 3:Language, 4:Publish Year, 5:Pages, 6:Owner, 7:Description, 8:Categories, 9:Status
    const title = cols[0];
    const authorName = cols[1];
    const isbn = cols[2] || null;
    const language = cols[3] || null;
    const publishYear = cols[4] ? parseInt(cols[4]) : null;
    const pages = cols[5] ? parseInt(cols[5]) : null;
    const owner = cols[6] || null;
    const description = cols[7] || null;
    const categoriesStr = cols[8] || ''; // semicolon separated
    // const status = cols[9]; // Ignored for now or could default

    if (!title || !authorName) throw new Error('Title and Author required');

    // 1. Author
    let author = await prisma.author.findFirst({ where: { name: authorName } });
    if (!author) {
        author = await prisma.author.create({ data: { name: authorName } });
    }

    // 2. Categories
    const categoryIds: string[] = [];
    const catNames = categoriesStr.split(';').map(s => s.trim()).filter(Boolean);
    for (const catName of catNames) {
        let category = await prisma.category.findUnique({ where: { name: catName } });
        if (!category) {
            category = await prisma.category.create({ data: { name: catName } });
        }
        categoryIds.push(category.id);
    }

    // 3. Book
    let book = null;
    if (isbn) {
        book = await prisma.book.findFirst({ where: { isbn } });
    }
    if (!book) {
        book = await prisma.book.findFirst({ where: { title, authorId: author.id } });
    }

    if (book) {
        // Update categories for existing books, create new entries otherwise
        await prisma.book.update({
            where: { id: book.id },
            data: {
                categories: {
                    connect: categoryIds.map(id => ({ id })) // Add new ones, don't remove existing (connect)
                }
            }
        });
    } else {
        await prisma.book.create({
            data: {
                title,
                authorId: author.id,
                isbn,
                language,
                publishYear,
                pages,
                owner,
                description,
                categories: {
                    connect: categoryIds.map(id => ({ id }))
                },
                readingStatuses: {
                    create: {
                        userId: currentUserId,
                        status: 'To read'
                    }
                }
            }
        });
    }
}
