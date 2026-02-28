import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const books = await prisma.book.findMany({
            where: { language: { not: null } },
            select: { language: true },
            distinct: ['language'],
            orderBy: { language: 'asc' },
        });

        const languages = books
            .map(b => b.language)
            .filter((l): l is string => !!l && l.trim() !== '');

        return NextResponse.json({ languages });
    } catch {
        return NextResponse.json({ languages: [] });
    }
}
